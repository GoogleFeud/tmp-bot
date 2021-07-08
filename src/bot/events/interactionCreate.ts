import { GatewayClientEvents } from "detritus-client";
import { InteractionCallbackTypes, InteractionTypes, MessageComponentTypes } from "detritus-client/lib/constants";
import { InteractionDataComponent } from "detritus-client/lib/structures";
import { CollectorErrorCauses } from "../../utils/ButtonCollector";


export default ({interaction}: GatewayClientEvents.InteractionCreate) => {
    if (!interaction.channelId) return;
    const listener = interaction.client.slashCommandClient!.buttonCollectors.get(interaction.channelId);
    const data = interaction.data;
    if (listener) {
        if (
            interaction.type === InteractionTypes.MESSAGE_COMPONENT &&
            data && data instanceof InteractionDataComponent &&
            data.componentType === MessageComponentTypes.BUTTON
        ) {
        const onError = listener.options.onError || (() => interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE));
        const obj = {
            user: interaction.user,
            choice: listener.options.buttons.find(btn => btn.customId === data.customId)!
        }
        if (listener.options.filter && !listener.options.filter(obj)) return onError(CollectorErrorCauses.FILTER, obj, interaction);
        if (listener.options.unique && listener.entries.some(e => e.user.id === interaction.userId)) return onError(CollectorErrorCauses.UNIQUE, obj, interaction);

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
    else if (
        interaction.client.slashCommandClient!.dropdownCollectors.has(interaction.channelId) &&
        interaction.type === InteractionTypes.MESSAGE_COMPONENT &&
        data && data instanceof InteractionDataComponent &&
        data.componentType === MessageComponentTypes.SELECT_MENU
    ) {
        const listener = interaction.client.slashCommandClient!.dropdownCollectors.get(interaction.channelId)!;
        const onError = listener.options.onError || (() => interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE));
        const obj = {
            user: interaction.user,
            options: data.values!
        }
        if (listener.options.filter && !listener.options.filter(obj)) return onError(CollectorErrorCauses.FILTER, obj, interaction);
        if (listener.options.unique && listener.entries.some(e => e.user.id === interaction.userId)) return onError(CollectorErrorCauses.UNIQUE, obj, interaction);

        if (listener.options.onSelect && listener.options.onSelect(obj, listener.entries, listener.lastInteraction, listener.message)) {
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