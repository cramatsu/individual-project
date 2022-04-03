const {Telegraf, Context} = require('telegraf');
const {TG_TOKEN} = require("../src/config");
const ytdl = require('ytdl-core');
const fs = require('fs');
const {join} = require('path');

const bot = new Telegraf(TG_TOKEN);

/**
 * Не надо воспринимать этот проект всерьез, ведь это всего-лишь индвидуальный проект,
 * который нужен школам для галочки.
 * Я уверен, что проверяющим индифферентно.
 * Даже не вздумайте клонировать этот репозиторий, если хотите чему-то научиться:
 * я использовал плохие практики написания кода, дабы незнающим было понятнее.
 * **/
bot.command('start', (ctx) => ctx.reply("Охаё"));


bot.command('download', async (ctx) => {

    const args = ctx.update.message.text.split(' ').filter(el => !el.startsWith('/')) ?? null;


    if (args.length < 1) {
        ctx.reply("Ошибка: аргументов не обнаружено");
        return;
    }

    if (!ytdl.validateURL(args[0])) {
        ctx.reply("Ошибка: некорректный аргумент");
        return;
    }

    const videoInfo = await ytdl.getBasicInfo(args[0]);

    if (+videoInfo.formats[0].contentLength > 52428800) {
        ctx.reply("Ошибка: видео слишком большое!");
        return;
    }


    await ctx.reply(`Начато сохранение видео: ${videoInfo.videoDetails.title}`);

    const video = await ytdl(args[0], {
        quality: "highest"
    });


    const tempID = `${ctx.update.message.date}.${ctx.update.message.message_id}.mp4`;
    const tempVidPath = join(__dirname, "..", 'cache', tempID);
    const tempFile = await fs.createWriteStream(tempVidPath);

    const stream = await video.pipe(tempFile);

    stream.on('finish', async () => {
        await ctx.replyWithVideo({
            source: tempVidPath
        });
        fs.unlinkSync(tempVidPath);

    });

});

bot.launch();



