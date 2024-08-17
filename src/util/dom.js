
import $ from "jquery";
import * as util from "/src/util";


export function getFocusedWritingBox() {
    //check doucment input box focused
    var writingBox = $(util.getActiveElement());
    if (writingBox.is(util.writingField)) {
        return writingBox.get(0);
    }
}
