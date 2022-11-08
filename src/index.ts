import express from 'express';
import 'dotenv/config';
import * as yup from 'yup'
import {Client, GatewayIntentBits, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Events, TextInputBuilder, TextInputStyle, ModalBuilder} from 'discord.js';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const app = express();

const port = 3000;

type ApplicationType = 'Intern'

type Clearance = 'Architect' | 'Missing Person'

const APPLICATION_TYPE_LIST: ApplicationType[] = ['Intern'];

const CLEARANCE_LIST: Clearance[] = ['Architect', 'Missing Person'];

interface QAType {
    q: string,
    a: string
}

interface UserData {
    questionAnswers: QAType[],
    applicationType: ApplicationType,
    accountAge: number,
    clearance: Clearance,
    profileUrl: string,
    iconUrl: string,
    username: string
}

const USER_DATA_SCHEMA = yup.object({
    questionAnswers: yup.array(yup.object({q: yup.string(), a: yup.string()})),
    applicationType: yup.string().oneOf(APPLICATION_TYPE_LIST),
    accountAge: yup.number(),
    clearance: yup.string().oneOf(CLEARANCE_LIST),
    profileUrl: yup.string(),
    iconUrl: yup.string(),
    username: yup.string()
})

app.get('/', async (req, res) => {
    const row = new ActionRowBuilder<ButtonBuilder>();

    const body = req.body;

    if (!USER_DATA_SCHEMA.isValidSync(body)) return;

    const accept = new ButtonBuilder({
        custom_id: 'accept',
        label: 'Accept',
        style: ButtonStyle.Primary
    });

    const decline = new ButtonBuilder({
        custom_id: 'decline',
        label: 'Decline',
        style: ButtonStyle.Danger
    });

    const embed = new EmbedBuilder({})
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
                }
            })
        ])

    row.addComponents(accept);
    row.addComponents(decline);

    const channel = await client.channels.fetch('1038878992045985862');

    if (channel.isTextBased()) {
        await channel.send({embeds: [embed], components: [row]});
    }

    res.status(200).send('OK');
    
})

app.listen(port, () => console.log('bot is listening on the port(3000)'))

client.on('ready', () => {
    console.log('bot started.')
})

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isButton() && (interaction.customId == 'accept' || interaction.customId == 'decline')) {
        console.log('accepted!')
        const row = new ActionRowBuilder<TextInputBuilder>();

        const reasonBox = new TextInputBuilder()
            .setCustomId(`textBox`)
            .setLabel('reason...')
            .setStyle(TextInputStyle.Paragraph);

        row.addComponents(reasonBox);

        const modal = new ModalBuilder()
            .setCustomId(`modal:${interaction.customId}`)
            .setTitle(`Submit the reason for ${interaction.customId === 'accept' ? 'accepting' : 'declining'} application`)
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
    else if (interaction.isModalSubmit()) {
        let reason = interaction.fields.getTextInputValue(`textBox`)
        let outcome = interaction.customId.split(':')[1];

        await interaction.channel.send(`outcome: ${outcome}.. Reason: ${reason}`);
    }
})

client.login(process.env.token)