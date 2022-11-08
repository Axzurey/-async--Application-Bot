"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const yup = __importStar(require("yup"));
const discord_js_1 = require("discord.js");
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
const app = (0, express_1.default)();
const port = 3000;
const APPLICATION_TYPE_LIST = ['Intern'];
const CLEARANCE_LIST = ['Architect', 'Missing Person'];
const USER_DATA_SCHEMA = yup.object({
    questionAnswers: yup.array(yup.object({ q: yup.string(), a: yup.string() })),
    applicationType: yup.string().oneOf(APPLICATION_TYPE_LIST),
    accountAge: yup.number(),
    clearance: yup.string().oneOf(CLEARANCE_LIST),
    profileUrl: yup.string(),
    iconUrl: yup.string(),
    username: yup.string()
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const row = new discord_js_1.ActionRowBuilder();
    const body = req.body;
    if (!USER_DATA_SCHEMA.isValidSync(body))
        return;
    const accept = new discord_js_1.ButtonBuilder({
        custom_id: 'accept',
        label: 'Accept',
        style: discord_js_1.ButtonStyle.Primary
    });
    const decline = new discord_js_1.ButtonBuilder({
        custom_id: 'decline',
        label: 'Decline',
        style: discord_js_1.ButtonStyle.Danger
    });
    const embed = new discord_js_1.EmbedBuilder({})
        .setColor(0x00ffff)
        .setTitle('Async Application')
        .setDescription('an application to [async]')
        .setFields([
        {
            name: 'Profile',
            value: body.profileUrl,
        },
        {
            name: 'Application Type',
            value: body.applicationType,
            inline: true,
        },
        {
            name: 'Account Age',
            value: body.accountAge.toString(),
            inline: true,
        },
        {
            name: 'Clearance',
            value: body.clearance,
            inline: true,
        },
        ...body.questionAnswers.map((v, i) => {
            return {
                name: v.q,
                value: v.a
            };
        })
    ]);
    row.addComponents(accept);
    row.addComponents(decline);
    const channel = yield client.channels.fetch('1038878992045985862');
    if (channel.isTextBased()) {
        yield channel.send({ embeds: [embed], components: [row] });
    }
    res.status(200).send('OK');
}));
app.listen(port, () => console.log('bot is listening on the port(3000)'));
client.on('ready', () => {
    console.log('bot started.');
});
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isButton() && (interaction.customId == 'accept' || interaction.customId == 'decline')) {
        console.log('accepted!');
        const row = new discord_js_1.ActionRowBuilder();
        const reasonBox = new discord_js_1.TextInputBuilder()
            .setCustomId(`textBox`)
            .setLabel('reason...')
            .setStyle(discord_js_1.TextInputStyle.Paragraph);
        row.addComponents(reasonBox);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`modal:${interaction.customId}`)
            .setTitle(`Submit the reason for ${interaction.customId === 'accept' ? 'accepting' : 'declining'} application`);
        modal.addComponents(row);
        yield interaction.showModal(modal);
    }
    else if (interaction.isModalSubmit()) {
        let reason = interaction.fields.getTextInputValue(`textBox`);
        let outcome = interaction.customId.split(':')[1];
        yield interaction.channel.send(`outcome: ${outcome}.. Reason: ${reason}`);
    }
}));
client.login(process.env.token);
//# sourceMappingURL=index.js.map