
import { RequestTypes } from "detritus-client-rest/lib/types";

export class EditableEmbed<FnArgs extends (...args: any) => void> {
    structure: RequestTypes.CreateChannelMessageEmbed
    onChange: FnArgs
    constructor(structure: RequestTypes.CreateChannelMessageEmbed, onChange: FnArgs) {
        this.structure = structure;
        this.onChange = onChange;
    }

    change(...vars: Parameters<FnArgs>) : RequestTypes.CreateChannelMessageEmbed {
        return Object.assign(this.structure, this.onChange(...(vars as Array<unknown>)));
    }
}