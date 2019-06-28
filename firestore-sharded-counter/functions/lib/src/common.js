"use strict";
/*
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function isUpdatedFrequently(shard) {
    if (!shard.exists)
        return false;
    // has it been updated in the past 30 seconds?
    return Date.now() / 1000 - shard.updateTime.seconds < 30;
}
exports.isUpdatedFrequently = isUpdatedFrequently;
/**
 * Partials are updated by appending to their internal "_updates_" array.
 * It grows unbounded and requires periodic compaction. This function
 * checks if partial shards has grown too big.
 */
function containsManyUpdates(partial) {
    if (!partial.exists)
        return false;
    const data = partial.data();
    return "_updates_" in data && data["_updates_"].length > 10;
}
exports.containsManyUpdates = containsManyUpdates;
/**
 * Constructs a collection group query to read all shards within provided range.
 */
function queryRange(db, collectionId, start, end, limit) {
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
exports.queryRange = queryRange;
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.delay = delay;
//# sourceMappingURL=common.js.map