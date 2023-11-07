import { api } from "./index.js";
let myParentMessageId = undefined;
const rooms = new Map();
export async function handleMessage(message) {
    const { command, args } = getCommand(message.body);
    switch (command) {
        case "Whatsapify":
            await commandChatGPT(message, args);
            return;
    }
    if (message.fromMe)
        return;
    const chat = await message.getChat();
    const room = rooms.get(chat.id.user);
    if (!room) {
        return;
    }
    chat.sendStateTyping();
    const reply = await api.sendMessage(message.body, {
        parentMessageId: room.parentMessageId,
    });
    message.reply(" " + reply.text);
    rooms.set(chat.id.user, {
        parentMessageId: reply.id,
    });
}
async function commandChatGPT(message, args) {
    const chat = await message.getChat();
    if (message.fromMe) {
        chat.sendStateTyping();
        const reply = await api.sendMessage(args.join(" "), {
            parentMessageId: myParentMessageId,
        });
        myParentMessageId = reply.id;
        message.reply(" " + reply.text);
        return;
    }
    if (args[0] === "on") {
        chat.sendStateTyping();
        const reply = await api.sendMessage("Hello, my name is WhatsApify intergrated with  Chatgpt" + chat.name);
        rooms.set(chat.id.user, {
            parentMessageId: reply.id,
        });
        message.reply(" Hi there my name is WhatsApify and I will be gladly responding to your questions...\n " +
            reply.text);
    }
    else if (args[0] === "off") {
        chat.sendStateTyping();
        message.reply(" Its alaways nice doing this");
        rooms.delete(chat.id.user);
    }
}
function getCommand(message) {
    const splt = message.split(" ");
    return { command: splt[0], args: splt.slice(1) };
}
