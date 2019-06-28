/*
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { firestore } from "firebase-admin";
import * as path from "path";
import { FieldPath } from "@google-cloud/firestore";
import { ShardedCounterController } from "./controller";

/**
 * Represents a document range that a single worker is responsible for.
 * 'start' and 'end' are paths to documents (the documents don't have to exist).
 */
export interface Slice {
  start: string; // a path to a first document (inclusive) in the slice
  end: string; // a path to a last document (exclusive) in the slice
}

/**
 * Each worker writes these stats at the end of successful run.
 */
export interface WorkerStats {
  lastSuccessfulRun: number; // epoch of last run
  shardsAggregated: number; // # of shards aggregated
  splits: string[]; // aggregated shards sampled every 100th element
  rounds: number; // number of aggregation rounds
  roundsCapped: number; // number of rounds that hit the query limit of 499 shards
}

export function isUpdatedFrequently(
  shard: firestore.DocumentSnapshot
): boolean {
  if (!shard.exists) return false;
  // has it been updated in the past 30 seconds?
  return Date.now() / 1000 - shard.updateTime.seconds < 30;
}

/**
 * Partials are updated by appending to their internal "_updates_" array.
 * It grows unbounded and requires periodic compaction. This function
 * checks if partial shards has grown too big.
 */
export function containsManyUpdates(
  partial: firestore.DocumentSnapshot
): boolean {
  if (!partial.exists) return false;
  const data = partial.data();
  return "_updates_" in data && data["_updates_"].length > 10;
}

/**
 * Constructs a collection group query to read all shards within provided range.
 */
export function queryRange(
  db: firestore.Firestore,
  collectionId: string,
  start: string,
  end: string,
  limit: number
): firestore.Query {
  let query = db.collectionGroup(collectionId).orderBy("__name__");
  if (start !== "") {
    query = query.startAt(start);
  }
  if (end !== "") {
    query = query.endBefore(end);
  }

  query = query.limit(limit);
  return query;
}

export async function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
