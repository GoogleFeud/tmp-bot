import { GatewayClientEvents } from "detritus-client";
import { InteractionCallbackTypes, InteractionTypes } from "detritus-client/lib/constants";
import { InteractionDataComponent } from "detritus-client/lib/structures";
import { ButtonCollectorErrorCauses } from "../../utils/ButtonCollector";


export default ({interaction}: GatewayClientEvents.InteractionCreate) => {
    if (!interaction.channelId) return;
    const listener = interaction.client.slashCommandClient!.buttonCollectors.get(interaction.channelId);
    const data = interaction.data;
    if (
        listener &&
        interaction.type === InteractionTypes.MESSAGE_COMPONENT &&
        data && data instanceof InteractionDataComponent
    ) {
        const onError = listener.options.onError || (() => interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE));
        const obj = {
            user: interaction.user,
            choice: listener.options.buttons.find(btn => btn.customId === data.customId)!
        }
        if (listener.options.filter && !listener.options.filter(obj, interaction)) return onError(ButtonCollectorErrorCauses.FILTER, obj, interaction);
        if (listener.options.unique && listener.entries.some(e => e.user.id === interaction.userId)) return onError(ButtonCollectorErrorCauses.UNIQUE, obj, interaction);

        if (listener.options.onClick && listener.options.onClick(obj, interaction, listener.entries, listener.message)) {
            interaction.client.slashCommandClient!.buttonCollectors.delete(interaction.channelId);
            listener.resolve({interaction, entries: listener.entries, message: listener.message});
            if (listener.timeout) clearTimeout(listener.timeout);
        }

        listener.entries.push(obj);

        if (listener.entries.length === listener.options.limit) {
            interaction.client.slashCommandClient!.buttonCollectors.delete(interaction.channelId);
            listener.resolve({interaction, entries: listener.entries, message: listener.message});
            if (listener.timeout) clearTimeout(listener.timeout);
        }

        if (!interaction.responded) interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
        listener.lastInteraction = interaction;
    }
}