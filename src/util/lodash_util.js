import _ from "lodash";
export default class _util {
    static getRangeOption(start, end, incNum = 1, roundOff = 0) {
        return _.keyBy(
            _.range(start, end, incNum)
                .map((num) => num.toFixed(roundOff))
                .map((num) => String(num))
        );
    }

    static getRecordNoDate(record) {
        return _.pick(record, [
            "sourceText",
            "sourceLang",
            "targetText",
            "targetLang",
            "actionType",
        ]);
    }

    static getRecordID(record) {
        return JSON.stringify(this.getRecordNoDate(record));
    }
}
