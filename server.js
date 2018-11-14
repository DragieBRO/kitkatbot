
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const http = require('http'); 
const express = require('express');
const weather = require('weather-js');
const yoMamma = require('yo-mamma').default;
const cpuStat = require("cpu-stat");
var request = require('request');
const snekfetch = require('snekfetch');
const os = require('os');
const cowsay = require('cowsay');
const moment = require('moment');
const wiki = require('wikijs').default;
const waifus = require('./waifus.json');
const total = Object.keys(waifus).length
const questions = require('./would-you-rather.json');
const facts = require('./dog-fact.json');
var catFacts = require('cat-facts');
const math = require('mathjs');
let fortnitee=require('fortnite');
const fortnite = new fortnitee('818069dc-9d75-4663-a949-7c9c4a496f4a');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
//const giphy = require('giphy-api')("W8g6R14C0hpH6ZMon9HV9FTqKs4o4rCk");
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
//newdata



client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
 
  client.user.setActivity(`k!help | ${client.users.size} Users `);
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }
 
  // And then we have two prepared statements to get and set the score data.
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

});


client.on("message", async message => {

  if(message.author.bot) return;
  let score;
  if (message.guild) {
    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, 
               user: message.author.id, 
               guild: message.guild.id, 
               points: 0, 
               level: 1 }
    }
    score.points++;
 
    client.setScore.run(score);
  }
 if (!message.guild) return;
  for (let id of message.mentions.users.keyArray()) {
    let score = client.getScore.get(id, message.guild.id);
    if (!score) score = {
      id: `${message.guild.id}-${id}`,
      user: id,
      guild: message.guild.id,
      points: 0,
      level: 0
    };
    score.level++;
    client.setScore.run(score);
  }
  
  
  
  if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
 
if(command === "stats") {
      
      var MSG = new Discord.RichEmbed()
    .setTitle("__**:tada: Total Message Count**__")
    .addField("------------------------------------------",
              ">> Total messages: " + "__**" + score.points + "**__" + "\n" +
              ">> Total mentions: " + "__**" + score.level + "**__" + "\n" +
              "-----------------------------------------", true)

    .setColor("0x#FF0000")

    message.channel.send(MSG);          
}
  
  //test   
  
  //topcommand
  if(command === "top") {
  const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
 
    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard")
    .setAuthor(client.user.username, client.user.avatarURL)
    .setDescription(":tada: __**Top 10 Chatters**__")      
    .setColor(0x00AE86);
 
  for(const data of top10) {
    embed.addField(client.users.get(data.user).tag, `>> **${data.points}** messages`);
  }
  return message.channel.send({embed});
}
  //addcommand
if(command === "add") {
  let isBotOwner=message.author.id=='262555029167276032';
  if(!isBotOwner){
  message.channel.send("You don't have permission to use this!");
  return;
  }

  const user = message.mentions.users.first() || client.users.get(args[0]);
  if(!user) return message.channel.send("Wrong syntax .. mention someone...!!");
 
  const pointsToAdd = parseInt(args[1], 10);
  if(!pointsToAdd) return message.channel.send("How much points you want to add...??")
 
  let userscore = client.getScore.get(user.id, message.guild.id);
  if (!userscore) {
    userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
  }
  userscore.points += pointsToAdd;
 
  client.setScore.run(userscore);
 
  return message.channel.send(`${user.username} has received ${pointsToAdd} points and has total of  ${userscore.points} points now.`);
}
  //removecommand
  if(command === "remove") {
  let isBotOwner=message.author.id=='262555029167276032';
  if(!isBotOwner){
  message.channel.send("You don't have permission to use this!");
  return;
  }
 
  const user = message.mentions.users.first() || client.users.get(args[0]);
  if(!user) return message.channel.send("Wrong syntax .. mention someone...!!");
 
  const pointsToAdd = parseInt(args[1], 10);
  if(!pointsToAdd) return message.channel.send("How much points you want to remove...??")
 
  
  let userscore = client.getScore.get(user.id, message.guild.id);
 
  if (!userscore) {
    userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
  }
  userscore.points -= pointsToAdd;
 
  client.setScore.run(userscore);
 
  return message.channel.send(`${user.username} has lost ${pointsToAdd} points and has total of  ${userscore.points} points now.`);
}
  //pingcommand
  if(command === "ping") {
    if (message.channel.type == "dm") return;
    const m = await message.channel.send(":ping_pong: **Calculating ping....** ");
    m.edit(`:ping_pong: **Pong** ${m.createdTimestamp - message.createdTimestamp}ms. **API Latency is** ${Math.round(client.ping)}ms`);
  }
  //bancommand
  if (command === "ban") {
 if (!message.member.hasPermission("BAN_MEMBERS")) {
   return message.channel.send(`You don't have permissions to use this.`)
  .then(msg => {
    msg.delete(7000)
  });
 }
 let reason = args.slice(1).join(' ');
 let user = message.mentions.users.first();
 let modlog = message.guild.channels.find(logch => logch.name=== "mod_logs");

 if (message.mentions.users.size < 1) {
   return message.channel.send(`Wrong syntax...put some effort!`)
  .then(msg => {
    msg.delete(7000)
  });
 }
 if (!message.guild.member(user).bannable) {
   return message.channel.send(`I can't ban this user. Do they have a higher role? Do I have kick permissions?`)
  .then(msg => {
    msg.delete(7000)
  });
 }
   if(!reason) reason="No reason provided";
 message.guild.ban(user, 2);
  message.channel.send(`Banned...get rekt..`)
  .then(msg => {
    msg.delete(7000)
  });
   modlog.send(`**${user.username}** has been banned by **${message.author.username}** for: \`${reason}\`.`);
    message.delete();
}
 //kickcommand
  if (command === "kick") {
 if (!message.member.hasPermission("KICK_MEMBERS")) {
   return message.channel.send(`You don't have permissions to use this.`)
  .then(msg => {
    msg.delete(7000)
  });
 }
    
 let reason = args.slice(1).join(' ');
 let user = message.mentions.users.first();
 let modlog = message.guild.channels.find(logch => logch.name=== "mod_logs");
    if (message.mentions.users.size < 1) {
   return message.channel.send(`Wrong syntax...put some effort!`)
  .then(msg => {
    msg.delete(7000)
  });
    }
 if (!message.guild.member(user).kickable) {
   return message.channel.send(`I can't kick this user. Do they have a higher role? Do I have kick permissions?`)
  .then(msg => {
    msg.delete(7000)
  });
 }
    if (!reason) reason="No reason provided";
 message.guild.member(user).kick();
message.channel.send(`Kicked...get rekt..`)
  .then(msg => {
    msg.delete(7000)
  });
 
 modlog.send(`**${user.username}** has been kicked by **${message.author.username}** for: \`${reason}\`.`);
    message.delete();
}
  //prunecommand
  if(command === "prune") {
  
    if(!message.member.hasPermission('MANAGE_MESSAGES'))
    return message.channel.send("You don't have permissions to use this!");
    const deleteCount = parseInt(args[0], 10);
  if(!deleteCount)
    return message.channel.send("How much..??").then(msg => {
    msg.delete(5000)
  })
    if(deleteCount<2 || deleteCount>100)
      return message.channel.send("lol nahh..thats too much..Enter number between 2 and 100..").then(msg => {
    msg.delete(5000)
  })
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
   
    message.channel.bulkDelete(fetched);
    let modlog = message.guild.channels.find(logch => logch.name=== "chat_logs");
    modlog.send(`**${message.author.username}** deleted **${deleteCount}** messages using **${client.user.username}**...`);
  
    return message.channel.send(`Deleted ${deleteCount} messages..`)
  .then(msg => {
    msg.delete(7000)
  })
      .catch(error => message.channel.send(`Couldn't delete messages because of: ${error}`));
   
  }
  //sinfocommand
  if(command==="sinfo"||command==="serverinfo"){
     let inline = true;
  if (message.channel.type === "dm") return
      const embed = new Discord.RichEmbed()
         .setAuthor(`Server Name: ${message.guild.name}`,message.guild.iconURL)
         .setColor(3447003)
         .setDescription(`:cop: **OwnerName**: >>${message.guild.owner.user.tag}   \n\   :notepad_spiral: **OwnerID**: >>${message.guild.owner.id}` ,true)
         .addField(':busts_in_silhouette: Member Count', `:couple: ${message.guild.memberCount  - message.guild.members.filter(m=>m.user.bot).size} users\n\:robot: ${message.guild.members.filter(m=>m.user.bot).size} bots`, true)
         .addField(':alarm_clock: AFK Timeout', `>>${message.guild.afkTimeout / 60} minutes`, true)
         .addField(':zzz: AFK Channel', `${message.guild.afkChannelID === null ? '>>No AFK Channel' : client.channels.get(message.guild.afkChannelID).name} (${message.guild.afkChannelID === null ? '' : message.guild.afkChannelID})`)
         .addField(':map: Location', `>>${message.guild.region}`,true)
         .addField(':calendar_spiral: Created at', `>>${message.guild.createdAt.toLocaleString()}`,true)
         .addField(`:eyes: Roles [${message.guild.roles.size-1}]`,message.guild.roles.map(r=>r).join(" ").replace("@everyone", " "))
         //.addBlankField(true)
         .setTimestamp()
         .setFooter(client.user.username, client.user.avatarURL);
        
         message.channel.send({embed});
     }
  //8ballcommand
  if (command==="8ball"){
        if (message.channel.type == "dm") return;
        const sayMessage = args.join(" ");
    if (sayMessage < 1) {
      
      return message.channel.send("You got it wrong.. **k!8ball** is mostly followed by a question.")
  .then(msg => {
    msg.delete(7000)
  })
      return;
    }
        var sayings = ["It is certain",
                                        "It is decidedly so",
                       "Ask your parents first.",
                                        "Without a doubt",
                                        "Yes, definitely",
                                        "You may rely on it",
                                        "As I see it, yes",
                                        "Most likely",
                                        "Outlook good",
                                        "Yes",
                                        "Signs point to yes",
                                        "Reply hazy try again",
                                        "Ask again later",
                                        "Better not tell you now",
                                        "Cannot predict now",
                                        "Concentrate and ask again",
                                        "Don't count on it",
                                        "My reply is no",
                                        "My sources say no",
                                        "Outlook not so good",
                                        "Very doubtful"];
    
            var result = Math.floor((Math.random() * sayings.length) + 0);
            message.reply(  sayings[result]);
    }
  //fortunecommand
  if (command==="fc"||command==="fortune"){
    if (message.channel.type == "dm") return;
    
        var sayings = ['Love will lead the way.',
        'If your desires are not extravagant, they will be rewarded.',
        'A new outlook brightens your image and brings new friends.',
        'You are not judged by your efforts you put in; you are judged on your performance.',
        'Sometimes you just need to lay on the floor.',
        'Integrity is the essence of everything successful.',
        'You have an unusually magnetic personality.',
        'Let your fantasies unwind...',
        'Accept what comes to you each day.',
        'Joys are often the shadows, cast by sorrows.',
        'You will always be successful in your professional career',
        'Don\'t bother looking for fault. The reward for finding it is low.',
        'Keep your eye out for someone special.',
        'Follow your bliss and the Universe will open doors where there were once only walls.'];
    
             let embed = new Discord.RichEmbed()
        .setTitle(`${message.author.username}'s Fortune`)
        .setColor('#50BB7C')
        .addField('Fortune :cookie: ', sayings[Math.floor(Math.random() * sayings.length)])
        return message.channel.send(embed);
    }
  //dadJokecommand
  if (command==="dad"||command==="dadjoke"){
    if (message.channel.type == "dm") return;
    
        var sayings = ["What time did the man go to the dentist? Tooth hurt-y",
    "I'm reading a book about anti-gravity. It's impossible to put down!",
    "Want to hear a joke about a piece of paper? Never mind... it's tearable.",
    "I just watched a documentary about beavers. It was the best dam show I ever saw!",
    "If you see a robbery at an Apple Store does that make you an iWitness?",
    "Spring is here! I got so excited I wet my plants!",
    "A ham sandwich walks into a bar and orders a beer. The bartender says, \"Sorry we don’t serve food here.\"",
    "What’s Forrest Gump’s password? 1forrest1",
    "I bought some shoes from a drug dealer. I don't know what he laced them with, but I was tripping all day!",
    "Why do chicken coops only have two doors? Because if they had four, they would be chicken sedans!",
    "What do you call a factory that sells passable products? A satisfactory.",
    "A termite walks into a bar and asks, \"Is the bar tender here?\"",
    "When a dad drives past a graveyard: Did you know that's a popular cemetery? Yep, people are just dying to get in there!",
    "Two peanuts were walking down the street. One was a salted.",
    "Why did the invisible man turn down the job offer? He couldn't see himself doing it.",
    "I used to have a job at a calendar factory but I got the sack because I took a couple of days off.",
    "How do you make holy water? You boil the hell out of it.",
    "A three-legged dog walks into a bar and says to the bartender, \"I’m looking for the man who shot my paw.\"",
    "When you ask a dad if he's alright: \"No, I’m half left.\"",
    "I had a dream that I was a muffler last night. I woke up exhausted!",
    "How do you tell the difference between a frog and a horny toad? A frog says, \"Ribbit, ribbit\" and a horny toad says, \"Rub it, rub it.\"",
    "Did you hear the news? FedEx and UPS are merging. They’re going to go by the name Fed-Up from now on.",
    "5/4 of people admit that they’re bad with fractions.",
    "MOM: \"How do I look?\" DAD: \"With your eyes.\"",
    "What is Beethoven’s favorite fruit? A ba-na-na-na.",
    "What did the horse say after it tripped? \"Help! I’ve fallen and I can’t giddyup!\”",
    "Did you hear about the circus fire? It was in tents!",
    "Don't trust atoms. They make up everything!",
    "What do you get when you cross an elephant with a rhino? Elephino.",
    "How many tickles does it take to make an octopus laugh? Ten-tickles.",
    "What's the best part about living in Switzerland? I don't know, but the flag is a big plus.",
    "What do prisoners use to call each other? Cell phones.",
    "Why couldn't the bike standup by itself? It was two tired.",
    "What do you call a dog that can do magic? A Labracadabrador.",
    "Why didn't the vampire attack Taylor Swift? She had bad blood.",
    "NURSE: \"Blood type?\" DAD: \"Red.\"",
    "SERVER: \"Sorry about your wait.\" DAD: \"Are you saying I’m fat?\”",
    "What do you call a fish with two knees? A “two-knee” fish.",
    "I was interrogated over the theft of a cheese toastie. Man, they really grilled me.",
    "What do you get when you cross a snowman with a vampire? Frostbite.",
    "Can February March? No, but April May!",
    "When you ask a dad if they got a haircut: \"No, I got them all cut!\"",
    "What does a zombie vegetarian eat? “GRRRAAAAAIIIINNNNS!”",
    "What does an angry pepper do? It gets jalapeño your face.",
    "Why wasn't the woman happy with the velcro she bought? It was a total ripoff.",
    "What did the buffalo say to his son when he dropped him off at school? Bison.",
    "What do you call someone with no body and no nose? Nobody knows.",
    "Where did the college-aged vampire like to shop? Forever 21.",
    "You heard of that new band 1023MB? They're good but they haven't got a gig yet.",
    "Why did the crab never share? Because he's shellfish."
        ];
             var DAD = new Discord.RichEmbed()
      .setDescription(sayings[Math.floor(Math.random() * sayings.length)])

      .setColor("0x#FF0000")

      message.channel.send(DAD);
    }
  
      //avatarcommand
      if (command=== "avatar"){
        if (message.channel.type == "dm") return;
        if (message.author.bot) return
         if (!message.mentions.users.size) {
           const embed = new Discord.RichEmbed()
           .setDescription(`${message.author.username}'s Avatar`)
    .setColor("#00ff00")
    .setImage(message.author.displayAvatarURL);

    message.channel.send(embed)
            }
        
            const avatarList = message.mentions.users.map(user => {
              const embed = new Discord.RichEmbed()
              .setDescription(`${user.username}'s Avatar`)
    .setColor("#00ff00")
    .setImage(user.displayAvatarURL);

    message.channel.send(embed)     
            }); 
      }
   //weathercommand
      if (command==="weather") { 
        if (message.channel.type == "dm") return;
       
        if (message.author.bot) return
        weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result) { 
            if (err) message.channel.send(err);
            if (result.length === 0) {
                return message.channel.send("Enter a valid location...")
  .then(msg => {
    msg.delete(7000)
  })
                return; 
            }

            var current = result[0].current; 
            var location = result[0].location; 
            const embed = new Discord.RichEmbed()
                .setDescription(`**__Weather Condition:__ ${current.skytext}**`) 
                .setAuthor(`Weather for ${current.observationpoint}`) 
                .setThumbnail(current.imageUrl) 
                .setColor(0x00AE86) 
                .addField(':alarm_clock: Timezone',`**>>**${location.timezone}`, true) 
                .addField(':regional_indicator_d: Degree Type',`**>>**${location.degreetype}`, true)
                .addField(':thermometer: Temperature',`**>>**${current.temperature} Degrees`, true)
                .addField(':white_sun_rain_cloud: Feels Like', `**>>**${current.feelslike} Degrees`, true)
                .addField(':dash: Winds',`**>>**${current.winddisplay}`, true)
                .addField(':droplet: Humidity', `**>>**${current.humidity}%`, true)

                message.channel.send({embed});
        });
    }
    //uptimecommand
    if (command=== "uptime") {
      if (message.channel.type == "dm") return;
      let days = Math.floor(client.uptime / 86400000);
      let hours = Math.floor(client.uptime / 3600000) % 24;
      let minutes = Math.floor(client.uptime / 60000) % 60;
      let seconds = Math.floor(client.uptime / 1000) % 60;

      message.channel.send(`__**Uptime**:__\n${days}d ${hours}h ${minutes}m ${seconds}s`);
   }
  //restartcommand
  if(command==="restart"){
    if (message.channel.type == "dm") return;
    let isBotOwner=message.author.id=='262555029167276032';
  if(!isBotOwner){
  message.channel.send("You don't have permission to use this!");
  return;
  }
    message.reply('The bot will now Restart.\n'
                            + 'Confirm the action by adding reaction above.');

                    message.react('👍').then(r => {
                            message.react('👎');
                    });

                    message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
                            { max: 1, time: 15000 }).then(collected => {
                                    if (collected.first().emoji.name == '👍') {
                                             message.channel.send('Restarting...')
    .then(message => client.destroy())
    .then(() => client.login(config.token)
          .then(() => message.channel.send("Successfully restarted..."))
          
          )}
                                    else
                                            return message.channel.send("Operation cancelled.!")
  .then(msg => {
    msg.delete(7000)
  })
                            }).catch(() => {
                                    return message.channel.send("No response after 30 sec..Operation cancelled..!")
  .then(msg => {
    msg.delete(7000)
  })
                            });
            }  
  //destroycommand
  if(command==="destroy"||command==="shutdown"){
    if (message.channel.type == "dm") return;
    let isBotOwner=message.author.id=='262555029167276032';
  if(!isBotOwner){
  message.channel.send("You don't have permission to use this!");
  return;
  }
    message.reply('The bot will now shut down.\n'
                            + 'Confirm the action by adding reaction above.');

                    // Reacts so the user only have to click the emojis
                    message.react('👍').then(r => {
                            message.react('👎');
                    });

                    // First argument is a filter function
                    message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
                            { max: 1, time: 15000 }).then(collected => {
                                    if (collected.first().emoji.name == '👍') {
                                            message.channel.send('Shutting down...');
                                            client.destroy();
                                    }
                                    else
                                            return message.channel.send("Operation cancelled..")
  .then(msg => {
    msg.delete(7000)
  })
                            }).catch(() => {
                                    return message.channel.send("No responce after 30sec..Operation cancelled!!")
  .then(msg => {
    msg.delete(7000)
  })
                            });
            } 
  //unbancommand
  if(command==="unban"){
     
  if(!message.member.hasPermission('ADMINISTRATOR')){
  message.channel.send("You don't have permission to use this!");
  return;
  }

      
  client.unbanAuth = message.author;
  let user = args[0];
  
  if (!user) return message.channel.send("Provide a valid UserID..")
  .then(msg => {
    msg.delete(7000)
  })
     message.guild.fetchBans().then(bans => {
        let member = bans.get(user);

        if (member == null) {
          message.channel.send("User isn't banned..")
  .then(msg => {
    msg.delete(7000)
  })
          return;
        }
       
       
  message.guild.unban(user);
    message.channel.send("User is now unbanned...what a lucky, whatever...")
  .then(msg => {
    msg.delete(7000)
  })
     } ); 
                               
 }         
  //memecommand
   if (command==="meme"){
      if (message.channel.type == "dm") return;
      var sayings = [
        //STOLEN MEMES :>
      'http://i.imgur.com/esZlkxd.jpg', 
      'http://i.imgur.com/hPW0SKr.jpg', 
      'http://i.imgur.com/Pqprl6S.jpg', 
      'http://i.imgur.com/2UsbZdM.jpg',
      'http://i.imgur.com/Ub93dy4.jpg', 
      'http://i.imgur.com/1WssNcV.jpg', 
      'http://i.imgur.com/yGr52CL.jpg', 
      'http://i.imgur.com/mTD0vZh.jpg',
      'http://i.imgur.com/BtBCqMg.jpg', 
      'http://i.imgur.com/cYLudbe.jpg', 
      'http://i.imgur.com/xdZa4Nj.jpg', 
      'http://i.imgur.com/Kb04V4W.jpg', 
      'http://i.imgur.com/5OSaf9u.png',
      'http://i.imgur.com/zqqu4Vi.jpg', 
      'http://i.imgur.com/uIJjMXA.jpg', 
      'http://i.imgur.com/HCfN7P8.jpg', 
      'http://i.imgur.com/cE21Jdc.jpg',
      'http://i.imgur.com/IiA4fRm.jpg', 
      'http://i.imgur.com/iKxAaq0.jpg', 
      'http://i.imgur.com/XEicSEg.jpg',
      'http://i.imgur.com/36yEXvC.jpg', 
      'http://i.imgur.com/vls4AR7.jpg', 
      'http://i.imgur.com/hu7jZr6.png',
      'http://i.imgur.com/gCJrl7e.jpg', 
      'http://i.imgur.com/K9Oetiw.png',
      'http://i.imgur.com/i6UWgIg.jpg',
      'http://i.imgur.com/vWjSwqf.jpg',
      'http://i.imgur.com/YTCAK51.jpg',
      'http://i.imgur.com/UMLm1mL.jpg',
      'http://i.imgur.com/68Zr7rs.jpg',
      'http://i.imgur.com/qnqITS3.jpg',
      'http://i.imgur.com/vOK9gcj.jpg',
      'http://i.imgur.com/qqS1oWu.jpg',
      'http://i.imgur.com/d3Wbs3l.jpg',
      'http://i.imgur.com/L5yUVYw.jpg',
      'http://i.imgur.com/GKnXFsQ.jpg',
      'http://i.imgur.com/Wf733vC.png',
      'http://i.imgur.com/tKQuOEe.jpg',
      'http://i.imgur.com/nf5ncDG.png',
      'http://i.imgur.com/oJVK22f.jpg',
      'http://i.imgur.com/3TQsgvH.jpg',
      'http://i.imgur.com/TuMP4qQ.png',
      'http://i.imgur.com/gPCXHzH.jpg',
      'http://i.imgur.com/5UoZyvQ.png',
      'http://i.imgur.com/SzyiCeS.jpg',
      'http://i.imgur.com/rJ8AnPx.jpg',
      'http://i.imgur.com/9PhB6tR.jpg',
      'http://i.imgur.com/dWwpKhz.jpg',
      'http://i.imgur.com/1DxoHS1.jpg',
      'http://i.imgur.com/T5hphPD.jpg',
      'http://i.imgur.com/D1hMVa3.jpg',
      'http://i.imgur.com/YlBWOUx.jpg',
      'http://i.imgur.com/Hs0bNbm.jpg',
      'http://i.imgur.com/o14goLr.jpg',
      'http://i.imgur.com/TFIA8ds.jpg',
      'http://i.imgur.com/cIiqY8w.jpg',
      'http://i.imgur.com/5dNlLf6.jpg',
      'http://i.imgur.com/ZABeZC8.jpg',
      'http://i.imgur.com/BDvkS64.jpg'


      ];
      var result = Math.floor((Math.random() * sayings.length) + 0);
            message.channel.send(  sayings[result]);
  }
  //pollcommand
const agree    = "✅";
const disagree = "❌";

if(command==="poll") {
  if (message.channel.type == "dm") return;
  if(!message.member.hasPermission('ADMINISTRATOR')){
    message.channel.send("You don't have permission to use this!.");
    return
  }
    const sayMessage = args.join(" ");
    if (!sayMessage) { 
      return message.channel.send("Wrong syntax... **k!poll** is followed by an argument...");
    }
 const embed = new Discord.RichEmbed()                                                                    
               .setColor("0x#FF0000")
                .setFooter("React to vote")
                 .setDescription(args.join(' '))
                   .setTitle(`Poll created by: ${message.author.username}`)
           const channel = message.guild.channels.find(ch => ch.name === 'polls');
   if(!channel) {
     
     message.channel.send("Poll created..")
  .then(msg => {
    msg.delete(5000)
  });
     let msg =await message.channel.send(embed);
     await msg.react(agree);
  await msg.react(disagree);
     return 
   }
   message.channel.send(`Poll created at ${channel}...`)
  .then(msg => {
    msg.delete(5000)
  })
  let msg =await channel.send(embed)
  await msg.react(agree);
  await msg.react(disagree);

 message.delete();
}
  //votekickcommand
if(command==="votekick") {
if(!message.member.hasPermission('ADMINISTRATOR','KICK_MEMBERS'))
      return message.channel.send("You don't have permissions to use this!");
  if (message.mentions.users.size === 0){
    return message.channel.send("Wrong syntax...Mention somone to kick after voting..")
  .then(msg => {
    msg.delete(7000)
  })
  }

  let kickmember = message.guild.member(message.mentions.users.first());
  if(!kickmember){
    message.channel.send("Mention a valid user...")
  .then(msg => {
    msg.delete(7000)
  })
  }

  if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")){
    return 
    message.channel.send("I can't kick this user! Do they have a higher role? Do I have kick permissions?")
  .then(msg => {
    msg.delete(7000)
  })
  }
  
  let msg = await message.channel.send("Vote now! (5 Minutes)");
  await msg.react(agree);
  await msg.react(disagree);

  const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 300000});
  msg.delete();

  var NO_Count = reactions.get(disagree).count;
  var YES_Count = reactions.get(agree);

  if(YES_Count == undefined){
    var YES_Count = 1;
  }else{
    var YES_Count = reactions.get(agree).count;
  }

  var sumsum = new Discord.RichEmbed()
  
            .addField("**Voting Finished**  :tada:", "----------------------------------------\n" +
                                          `**Voted For:** :pushpin: **Kick? **${kickmember}\n`+ 
                                          "----------------------------------------\n"+
                                          "**Total votes:** :white_check_mark: =" + `**${YES_Count-1}**\n` +
                                          "**Total votes:** :negative_squared_cross_mark: =" + `**${NO_Count-1}**\n` +
                                          "----------------------------------------\n" +
                                          "**NOTE:** Votes needed to kick (3+)\n" +
                                          "----------------------------------------", true)
//
            .setColor("0x#FF0000")

  await message.channel.send({embed: sumsum});

  if(YES_Count >= 3 && YES_Count > NO_Count){

    kickmember.kick().then(member => {
      message.channel.send("Kicked...");
      const channel = member.guild.channels.find(ch => ch.name === 'mod_logs');
    channel.send(`**${member.user.username}** was kicked after \`voting\` :white_check_mark:= **${YES_Count-1}**. :negative_squared_cross_mark:= **${NO_Count-1}**`);
    })
  }else{

    message.channel.send("\n"+"Safe...for NOW..")
  .then(msg => {
    msg.delete(7000)
  })
  }

}
  //votebancommand
  if(command==="voteban") {
if(!message.member.hasPermission('BAN_MEMBERS'))
      return message.channel.send("You don't have permissions to use this!");
  if (message.mentions.users.size === 0){
    return message.channel.send("Wrong syntax..mention someone to ban after voting..")
  .then(msg => {
    msg.delete(7000)
  })
  }

  let banmember = message.guild.member(message.mentions.users.first());
  if(!banmember){
    message.channel.send("Mention a valid user...")
  .then(msg => {
    msg.delete(7000)
  })
  }

  if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")){
    return 
    message.channel.send("I can't ban this user! Do they have a higher role? Do I have kick permissions?")
  .then(msg => {
    msg.delete(7000)
  })
  }
  
  let msg = await message.channel.send("Vote now! (5 Minutes)");
  await msg.react(agree);
  await msg.react(disagree);

  const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 300000});
  msg.delete();

  var NO_Count = reactions.get(disagree).count;
  var YES_Count = reactions.get(agree);

  if(YES_Count == undefined){
    var YES_Count = 1;
  }else{
    var YES_Count = reactions.get(agree).count;
  }

  var sumsum = new Discord.RichEmbed()
  
            .addField("**Voting Finished**  :tada:", "----------------------------------------\n" +
                                          `**Voted For:** :pushpin: **Ban? **${banmember}\n`+ 
                                          "----------------------------------------\n"+
                                          "**Total votes:** :white_check_mark: =" + `**${YES_Count-1}**\n` +
                                          "**Total votes:** :negative_squared_cross_mark: =" + `**${NO_Count-1}**\n` +
                                          "----------------------------------------\n" +
                                          "**NOTE:** Votes needed to ban (3+)\n" +
                                          "----------------------------------------", true)

            .setColor("0x#FF0000")

  await message.channel.send({embed: sumsum});

  if(YES_Count >= 3 && YES_Count > NO_Count){
 
    banmember.ban().then(member => {
      message.channel.send(`Banned...get rekt!!`)
  .then(msg => {
    msg.delete(7000)
  })
      const channel = member.guild.channels.find(ch => ch.name === 'mod_logs');
    channel.send(`**${member.user.username}** has been banned after \`Voting\`.. :white_check_mark:= **${YES_Count-1}**. :negative_squared_cross_mark:= **${NO_Count-1}**  `);
    })
  }else{

    message.channel.send("\n"+`Safe.....for NOW..!`)
  .then(msg => {
    msg.delete(7000)
  })
  }

}
  //mutecommand
if(command === "mute") {
let reason = args.slice(1).join(' ');
let user = message.mentions.users.first();
let logchannel = message.guild.channels.find(ch=>ch.name=== 'mod_logs');
let role = message.guild.roles.find(rol=>rol.name=== 'Muted')
//CHANGE THIS ^^

if (!message.member.hasPermission("MUTE_MEMBERS")) {
message.channel.send("You don't have permission to use this! ");
  return;
}
if (!reason) reason="No Reason Provided.";
if (message.mentions.users.size < 1) return message.channel.send(`Mute who..??`)
  .then(msg => {
    msg.delete(7000)
  });
if(!role) message.channel.send("Role `Muted` was not found");
if (message.guild.member(user).roles.has(role.id)) return message.channel.send(`User is already muted...`)
  .then(msg => {
    msg.delete(7000)
  });
message.guild.member(user).addRole(role.id);
message.channel.send(`User muted..`)
  .then(msg => {
    msg.delete(7000)
  });
    logchannel.send(`**${user.username}** was muted by **${message.author.username}** for: \`${reason}\``);

  }
  //unmutecommand
if(command === "unmute") {

let user = message.mentions.users.first();
let logchannel = message.guild.channels.find(ch=>ch.name=== 'mod_logs');
let role = message.guild.roles.find(rol=>rol.name=== 'Muted');

if (!message.member.hasPermission("MUTE_MEMBERS")) {
message.channel.send("You don't have permission to use this command.");
  return;
}

if (message.mentions.users.size < 1) return message.channel.send(`Unmute who...???`)
  .then(msg => {
    msg.delete(7000)
  });
if (!message.guild.member(user).roles.has(role.id)) return message.channel.send(`User isn't muted...`)
  .then(msg => {
    msg.delete(7000)
  });
   
message.guild.member(user).removeRole(role.id);
message.channel.send(`Unmuted .whatever...`)
  .then(msg => {
    msg.delete(7000)
  });
    logchannel.send(`**${user.username}** was unmuted by **${message.author.username}**...`);

  }
  //yomammacommand
  if(command==="yomamma") {
    if (message.channel.type == "dm") return;
    let insult = yoMamma();
  const embed = new Discord.RichEmbed()
           .setDescription(insult)
    .setColor("#00ff00")
    message.reply(embed)
}
  //warncommand
  if(command==="warn") {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have premission to do this!");
  let reason = args.slice(1).join(' ');
  let user = message.mentions.users.first();
  if (message.mentions.users.size < 1) return message.channel.send("Warn who..???")
  .then(msg => {
    msg.delete(5000)
  });
  if (reason.length < 1) {
    return message.channel.send(`You should know that you can't warn without a valid reason...`)
  .then(msg => {
    msg.delete(5000)
  });
  }
    message.channel.send(`User warned..`)
  .then(msg => {
    msg.delete(7000)
  });
   
  const channel = message.guild.channels.find(ch => ch.name === 'mod_logs');
  channel.send(`**${user.username}** has been warned for: \`${reason}\``);
  let dmsEmbed = new Discord.RichEmbed()
  .setTitle("Warn")
  .setColor("#00ff00")
  .setDescription(`You have been warned on \`${message.guild.name}\``)
  .addField("Warned by", message.author.tag)
  .addField("Reason", reason);

  user.send(dmsEmbed);

  message.delete();

}
  //whoiscommand
  if(command==="whois") {
    let inline = true
    let resence = true
    const status = {
        online: "Online",
        idle: "Idle",
        dnd: "Do Not Disturb",
        offline: "Offline/Invisible"
      }

const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
let target = message.mentions.users.first() || message.author
            let embed = new Discord.RichEmbed()
                //.setAuthor(member.user.username)
                .setThumbnail((target.displayAvatarURL))
                .setColor("#00ff00")
            .setDescription(":closed_book: **__User Information__**",true)
                .addField(":bust_in_silhouette: Full Username", `>>${member.user.tag}`, inline,true)
                .addField(":notebook_with_decorative_cover: ID", `>>${member.user.id}`, inline,true)
                .addField(":spy: Nickname", `${member.nickname !== null ? `>>${member.nickname}` : ">>No Nickname"}`, true)
                .addField(":red_circle: Status", `>>${status[member.user.presence.status]}`, inline, true)
                .addField(":video_game: Playing", `${member.user.presence.game ? `🎮>>${member.user.presence.game.name}` : ">>Not playing"}`,inline, true)
                
                .addField(":regional_indicator_r: Roles", `${member.roles.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).join(" **|** ") || "No Roles"}`, true)
                .addField(":inbox_tray: Joined Discord At", `>>${member.user.createdAt}`)
                .addField(":inbox_tray: Joined Server At", `>>${member.guild.joinedAt}`)
                  
                .setFooter(`Information about ${member.user.username}`)
                .setTimestamp()
    
            message.channel.send(embed);

            message.delete();
    }
  //statuscommand
  if(command==="status"){
    if (message.channel.type == "dm") return;
            let { version } = require("discord.js");
     
            cpuStat.usagePercent(function(err, percent, seconds) {
              if (err) {
                return console.log(err);
              }
             
             let secs = Math.floor(client.uptime % 60);
             let days = Math.floor((client.uptime % 31536000) / 86400);
             let hours = Math.floor((client.uptime / 3600) % 24);
             let mins = Math.floor((client.uptime / 60) % 60);
     
              //let duration = moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
              let embedStats = new Discord.RichEmbed()
             .setTitle(":robot:** BOT STATUS **")
             .setColor("#00ff00")
             .addField("• Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
             .addField("• Uptime ", `${hours}h ${mins}m`, true) //`${duration}`, true)
             .addField("• Users", `${client.users.size.toLocaleString()}`, true)
             .addField("• Servers", `${client.guilds.size.toLocaleString()}`, true)
             .addField("• Channels ", `${client.channels.size.toLocaleString()}`, true)
             .addField("• Discord.js", `v${version}`, true)
            // .addField("• Node", `${process.version}`, true)
             .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
             .addField("• CPU usage", `\`${percent.toFixed(2)}%\``,true)
             .addField("• Arch", `\`${os.arch()}\``,true)
             .addField("• Platform", `\`\`${os.platform()}\`\``,true)
   
             message.channel.send(embedStats)
             })
  }
   //saycommand
  if(command === "say") {
    
    if (message.channel.type == "dm") return;
    const sayMessage = args.join(" ");
    if (sayMessage < 1) {
      message.delete().catch(O_o=>{}); 
      return message.channel.send("Say what...?")
  .then(msg => {
    msg.delete(7000)
  });
    }
    
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }
  //ratecommand
  if(command==="rate") {
  if (message.channel.type == "dm") return;

let ratus = message.mentions.members.first();
if(!ratus) return message.channel.send('Rate who..??')
  .then(msg => {
    msg.delete(5000)
  });

let rates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

let result = Math.floor((Math.random() * rates.length));

if(ratus.user.id === message.author.id) {
  return message.channel.send(`**${message.author.username}**, I'd give you ${result}/10  :thinking: `);
} else return message.channel.send(`I'd give **__${ratus.user.username}__** ${result}/10  :thinking: `);
message.delete();
}
  //catcommand
  if(command==="cat") {
    if (message.channel.type == "dm") return;
        request('http://edgecats.net/random', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                return message.channel.send(body);
              message.delete();
            }                            
        });
    }
  //dogcommand
  if(command==="dog") {
    if (message.channel.type == "dm") return;

    const { body } = await snekfetch.get('https://random.dog/woof.json');
    const embed = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage(body.url);

    message.channel.send(embed)
message.delete();
}
  //cowsaycommand
  if(command==="cowsay") {
 if (message.channel.type == "dm") return;
    let txt = message.content.split(' ').slice(1).join(' ');
    if (!txt) 
        return message.channel.send("Invalid arguments... what do you want the cow to say?")
    message.channel.send(cowsay.say({
        text: txt,
        e: 'oO'
    }), {code: 'css'});
}
  //reportcommand
  if(command==="report") {
    if (message.channel.type == "dm") return;
    let args = message.content.split(' ').slice(1).join(' ');
    message.delete();
    let guild = message.guild;
    const cnl = client.channels.get('510438402521563137');
    if(!args)
      return message.channel.send("Wrong syntax...Add some details in your report..")
    message.reply('Hey.. I got your report , I will fix it as soon as possible.. Here is your report:');
    const embed2 = new Discord.RichEmbed()
  .setAuthor(`Report from ${message.author.tag}`, message.author.displayAvatarURL)
  .addField('Report:', `**Reporter:** ${message.author.tag}\n**Server:** ${guild.name}\n**Details:** ${args}`)
  .setThumbnail(message.author.displayAvatarURL)
  .setFooter(`${moment().format('MMMM Do YYYY, h:mm:ss a')}`)
  .setColor(16711728);
    
    message.channel.send({embed: embed2});
  
    const embed = new Discord.RichEmbed()
  .setAuthor(`Report from ${message.author.tag}`, message.author.displayAvatarURL)
  .addField('Report:', `**Reporter:** ${message.author.tag}\n**Server:** ${guild.name}\n**Details:** ${args}`)
  .setThumbnail(message.author.displayAvatarURL)
  .setColor(16711728);
    cnl.send({embed})
}
  //piccommand
  if(command==="pic"|| command==="picture") {
    if (message.channel.type == "dm") return;
    snekfetch.get('http://www.splashbase.co/api/v1/images/random').then(photo => {
        const embed = new Discord.RichEmbed()
    .setImage(`${photo.body.url}`);
        message.reply(`Here is your complete random picture :frame_photo:`,{embed})
    }).catch(err => {
        if (err) {
            message.channel.send('Something went wrong...Try again!!');
        }
    });
}
  //quotecommand
  if(command==="quote"){
    if (message.channel.type == "dm") return;
    snekfetch.get('http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en').then(quote => {
        if (quote.body.quoteText === undefined) {
            return message.reply('Something is messing up the API try again later..');
        }
        const embed = new Discord.RichEmbed()
    .setAuthor('A smart person said once:', 'http://pngimages.net/sites/default/files/right-double-quotation-mark-png-image-80280.png')
    .addField('Quote-', `"${quote.body.quoteText}"\n**Author:** ${quote.body.quoteAuthor}`);
        message.reply({embed})
    }).catch(err => {
        if (err) {
            message.channel.send('Something went wrong...Try again..!');
        }
    });
}
  //tsuncommand
  const tsun = [
    "N-No, it's not like I did it for you! I did it because I had freetime, that's all! ┐(￣ヘ￣;)┌",
    "I like you, you idiot! 💢",
    "BAKAAAAAAAAAAAAAAA!!!!! YOU'RE A BAKAAAAAAA!!!! 💢💢",
    "I'm just here because I had nothing else to do!",
    "Are you stupid?",
    "💢 You're such a slob!",
    "You should be grateful!",
    "You're free anyways, right?",
    "Don't misunderstand, it's not like I like you or anything... ( ￣＾￣)",
    "H-Hey.... (//・.・//)",
    "....T-Thanks.....",
    "B-Baka! 💢",
    "T-Tch! S-Shut up!",
    "I just had extra, so shut up and take it! 💢",
    "Can you be ANY MORE CLUELESS?",
    "HEY! It's a privilege to even be able to talk to me! You should be honored! 💢",
    "Geez, stop pushing yourself! You're going to get yourself hurt one day, you idiot!",
    "I-I am not a tsundere, you b-baka!",
    "💢 I'm only t-talking to you because I have nothing else to do, b-baka!",
    "Don't get the wrong idea! BAKA!",
    "I-I'm doing this p-purely for my own benefit. So d-don't misunderstand, you idiot!",
    "Urusai, urusai, urusai!! 💢",
    "I-It's not that I like you or anything, I just happened to make too much for lunch...",
    "Don't misunderstand...baka.",
    "B-baka! I am not a tsundere! 💢",
    "Na-nan des-ka?"
]
  if(command==="tsun"||command==="tsundere") {
   if (message.channel.type == "dm") return;
    return message.reply(tsun[Math.round(Math.random() * (tsun.length - 1))]);
 
}
  //starcommand
  if(command==="star") {
    if (message.channel.type == "dm") return;
    const signs = [
    "capricorn",
    "aquarius",
    "pisces",
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius"
]

        const sign = message.content.split(/\s+/g).slice(1).join(" ");
        if (!sign) return message.reply("Wrong syntax...provide a valid star name..!")
  .then(msg => {
    msg.delete(10000)
  });
          
        if (!signs.includes(sign.toLowerCase())) return message.reply("Not a valid star..Here is the list.. \n _capricorn, aquarius, pisces, aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius_ ")
  .then(msg => {
    msg.delete(10000)
  });

        const text = await snekfetch
            .get(`http://sandipbgt.com/theastrologer/api/horoscope/${sign}/today`);
        const body = JSON.parse(text.body);

        var horoscope = body.horoscope
        var replaced = horoscope.replace('(c) Kelli Fox, The Astrologer, http://new.theastrologer.com', '')

        const embed = new Discord.RichEmbed()
            .setColor('#5D7B9D')
            .setAuthor(`Horoscope for ${body.sunsign} on ${body.date}`, 'http://images.indianexpress.com/2017/01/zodiac-love-2017-main_820_thinkstockphotos-481896132.jpg?w=820')
            .setDescription(replaced)
            .setTimestamp()
            .setFooter(`${message.author.username}'s Horoscope`)
            .addField('Mood', body.meta.mood, true)
            .addField("Intensity", body.meta.intensity, true);
        return message.reply(embed);
    message.delete();
    }
  //pickupcommand
  const line = require('./pickuplines.json');
  if(command==="pickup") {
    if (message.channel.type == "dm") return;
        const embed = new Discord.RichEmbed()
            .setDescription('💖 | ' + line[Math.round(Math.random() * (line.length - 1))])
            .setColor('#C597B8');
        return message.channel.send({ embed });
}
  //wikicommand
  if(command==="wiki") {
    
    
if (message.channel.type == "dm") return;
        const query = message.content.split(/\s+/g).slice(1).join(" ");

        if (!query) {
            return message.reply('You got it wrong..**k!wiki** is followed by a **search** term..');
        }

        const data = await wiki().search(query, 1);
        if (!data.results || !data.results.length) {
            return message.channel.send('No result found...!');
        }

        const page = await wiki().page(data.results[0]);
        const summary = await page.summary();
        const paragraphs = summary.split('\n');

        if (!query.options) {
            paragraphs.length = Math.min(1, paragraphs.length);
        }
        try {
            const embed = new Discord.RichEmbed()
                .setAuthor(page.raw.title)
                .setDescription(paragraphs.join('\n\n'))
                .addField('Link', `**${page.raw.fullurl}**`)
                .setFooter('Wikipedia', 'https://a.safe.moe/8GCNj.png')
                .setColor('#c7c8ca');
            return message.channel.send(`Search result for \`${query}\` on Wikipedia:`, { embed });

        } catch (err) {
            const embed = new Discord.RichEmbed()
                .setAuthor(page.raw.title)
                .setDescription("This paragraph was too long for the embed, visit the link down if its that important.")
                .addField('Link', `**${page.raw.fullurl}**`)
                .setFooter('Wikipedia', 'https://a.safe.moe/8GCNj.png')
                .setColor('#c7c8ca');
             return message.reply(`Search result for \`${query}\` on Wikipedia:`, { embed });
        }
    }
  //waifucommand
  if(command==="waifu") {
  if (message.channel.type == "dm") return;
        let somethingThere = message.content.split(/\s+/g).slice(1).join(" ");
        const percentage = Math.random()
        if (!somethingThere || args.number == 'none') {
            var random = Math.floor(Math.random() * total + 1);
            var waifu = waifus[random];

            const embed = new Discord.RichEmbed()
                .setAuthor(waifu.name, waifu.image)
                .setDescription(waifu.origin)
                .setImage(waifu.image)
                .setFooter(`Waifu Number ${random}`)
                .setColor('#FAC193');
            var ms = await message.reply(`Here is what I found for you.,💝 **${waifu.name}**? `, { embed: embed });
            await ms.react('👍');
            await ms.react('👎');

            return null;

        }
    else 
      return message.reply("Correct usage is \`k!waifu\` only.");
}
  //catfactcommand
   if (command==="catfact") {
    if (message.channel.type == "dm") return;
			const fact = catFacts.random();
			message.reply(`**:cat: Do you know**...${fact}.`);
		}
  //dogfactcommand
  if (command==="dogfact") {
    if (message.channel.type == "dm") return;
			return message.reply(`:dog: **Do you know**...`+facts[Math.floor(Math.random() * facts.length)]);
		}
  //wyrcommand
if(command==="wyr"|| command==="wouldyourather") {
	if (message.channel.type == "dm") return;
		return message.reply(`:grimacing: `+questions[Math.floor(Math.random() * questions.length)]);
}
  //calccommand
  if(command==="calc"){
    if (message.channel.type == "dm") return;
    if(!args[0]) return message.channel.send("Calc what..??");
    let resp;
    try{
      
      resp=math.eval(args.join(' '));      
    }catch(e){
      return message.reply("Enter a valid calculation..");
    }
    const embed=new Discord.RichEmbed()
    .setColor(3447003)
    .setTitle("Math Calculation")
    .addField("Input",`\`\`\`js\n${args.join('')}\`\`\``)
    .addField("Output",`\`\`\`js\n${resp}\`\`\``)
    message.channel.send(embed) 
  }
  //setgamecommand
  if (command === "setgame") {
   if (message.author.id == "262555029167276032") {
   var argresult = args.join(' ');
   if (!argresult) argresult="k!help";
   client.user.setActivity(argresult);
   message.reply("All set.. :thumbsup: ")
  .then(msg => {
    msg.delete(5000)
  });
   } else 
     return
     message.delete();
 }
  //fortnitecommand
  if (command === "fortnite") {

      
      
      let username = args[0];

        let platform = args[1] || 'pc';
      if(!username) return message.reply("Wrong syntax...provide a username.![PC players only]")

      let data = fortnite.user(username).then(data => {

        let stats = data.stats;
        let lifetime = stats.lifetime;
        
        let score = lifetime[6] ['Score'];
        let mplayed = lifetime[7] ['Matches Played'];
        let wins = lifetime[8] ['Wins'];
        let winper = lifetime[9] ['Win%'];
        let kills = lifetime[10] ['Kills'];
        let kd = lifetime[11] ['K/d'];

        let botIcon = client.user.displayAvatarURL;
        let fEmbed = new Discord.RichEmbed()
        .setTitle("Fortnite Lifetime Stats")
        .setAuthor(data.username)
        .setColor("#0x5982e8")
        .setTimestamp()
        .addField("Wins", wins, true)
        .addField("Kills", kills, true)
        .addField("Score", score, true)
        .addField("Matches Played", mplayed, true)
        .addField("Win %", winper, true)
        .addField("KDR", kd, true)
        .setFooter("© DragieBRO", botIcon);

        return message.channel.send(fEmbed);
      });
    
    }
  //countcommand
  if(command==="count"){
    message.channel.send(`:tada: **${client.guilds.size}** Servers...`)
  .then(msg => {
    msg.delete(7000)
  });
    message.delete();
  }
  //addrolecommand
  if(command==="addrole") {

  if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("You don't have premission to do that!.");
  let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    let xdemb = new Discord.RichEmbed()
    .setColor("#00ff00")
    .addField("AddRole Command", "Usage: k!addrole <@user> <role-name>")
    .addField("NOTE", "Role name is CaseSensitive..")
  if(!rMember) return message.channel.send(xdemb);

  let role = args.join(" ").slice(22);
  if(!role) return message.channel.send('Specify a **role** name | CaseSensitive..')
  .then(msg => {
    msg.delete(5000)
  })
    message.delete();
  
  let gRole = message.guild.roles.find(`name`,role);
  if(!gRole) return message.channel.send("Couldn't find the role..make sure to type role name correctly | Case Sensitive ")
  .then(msg => {
    msg.delete(5000)
  })
message.delete();
  if(rMember.roles.has(gRole.id)) return message.channel.send('User already has this role..')
  .then(msg => {
    msg.delete(5000)
  })
    message.delete();
  await(rMember.addRole(gRole.id));

  
    await message.channel.send(`Successfully Given **${rMember.user.username}'s** \`${gRole.name}\` role..`)
  .then(msg => {
    msg.delete(5000)
  })
  message.delete();

}
  //removerolecommand
  if(command==="rrole"||command==="removerole") {

  if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("You don't have premission to use that!.");
  let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    let xdemb = new Discord.RichEmbed()
    .setColor("#00ff00")
    .addField("RemoveRole Command", "Usage: k!removerole <@user> <role-name>")
    .addField("NOTE", "Role name is CaseSensitive..")
  if(!rMember) return message.channel.send(xdemb);

  let role = args.join(" ").slice(22);

  if(!role) return message.channel.send('Specify a **role** name | CaseSensitive..')
  .then(msg => {
    msg.delete(5000)
  })
     message.delete();
  let gRole = message.guild.roles.find(`name`, role);
  if(!gRole) return message.channel.send("Couldn't find the role..make sure to type role name correctly | Case Sensitive ")
  .then(msg => {
    msg.delete(5000)
  })
 message.delete();
  if(!rMember.roles.has(gRole.id)) return  message.channel.send(`User does't has this role..`)
  .then(msg => {
    msg.delete(5000)
  })
     message.delete();
  await(rMember.removeRole(gRole.id));

  
  await message.channel.send(`Removed **${rMember.user.username}'s** \`${gRole.name}\` role..`)
  .then(msg => {
    msg.delete(5000)
  })
  message.delete();

}
  //helpcommand
  if (command==="help"){
       
      if (message.author.bot) return
      message.channel.send({embed: 
        {
        color: 0xff005d,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
      fields:[
        {
          name: "**INVITE**",
          value: "Click [HERE](https://discordapp.com/oauth2/authorize?client_id=508696598016950275&scope=bot&permissions=2146565631) to invite Bot."
        },
          {
            name: ":tools: Moderation",
            value: "`kick` `votekick` `ban` `voteban` `unban` `warn` `mute` `unmute`\n\`prune`  `removerole` `addrole`"
          },
          {
            name:":flower_playing_cards: Fun Commands",
            value:" `8ball` `dadjoke` `meme` `yomamma` `rate` `cat` `dog` `pic` `wyr`\n\`cowsay` `tsundere` `pickup` `waifu`  `clapify` `reverse` `mock`",
            
          },
        {
            name: ":computer: Utility Commands",
            value: "`ping` `uptime` `status` `sinfo` `roleinfo` `finduser` `whois` \n\`weather` `avatar` `say` `report` `poll` `stats` `top`  "
          },
        {
            name: ":books: Informative Commands",
            value: "`fortune` `quote` `star`  `wiki` `calc` `dogfact` `catfact` `unicode`"
          },
        {
            name: ":ghost:  Roleplay Commands",
            value: "`highfive` `pat` `hug` `kiss` `kill`"
          },
        {
            name: ":video_game: Gamming Commands",
            value: "`fortnite` `steamrep`"
          },
         
        {
            name: ":spy: Owner Only",
            value: "`restart` `destroy` `add` `remove` `setgame`"
          },
       
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "Bot made by DragieBRO"
        }
      }
    }
      )};
  //extra
  if(command==="pat") {
    var member = message.mentions.members.first();
if (!member) return message.channel.send(":no_entry_sign: You need to **Mention** someone :face_palm:");
   message.channel.send(`:speech_balloon: ${member.user} You have been patted by ${message.author.username} `);
   var sayings = [
										"https://gph.is/2adU6Zm",
										"https://tenor.com/rjm5.gif",
                    "https://tenor.com/PM1V.gif",
                    "https://tenor.com/vyus.gif",
                    "https://tenor.com/QYVU.gif",
                     "https://tenor.com/QvHK.gif"
										];

   var result = Math.floor((Math.random() * sayings.length) + 0);
     message.channel.send(sayings[result]);
   
}
  //kiss
if (command==="kiss") {
    var member = message.mentions.members.first();
if (!member) return message.channel.send(":no_entry_sign: You need to **Mention** someone :face_palm:");
   message.channel.send(`:kiss:  ${member.user} You have been kissed by ${message.author.username} :heartpulse: `);
   var sayings = [
										"https://gph.is/1UUOaA8",
                      "http://gph.is/1mv7IKS",
                        "http://gph.is/1sFKvji",
                          "http://gph.is/1hHtoTW",
     "https://gph.is/XJMy4p",
     "http://gph.is/1ad2zHb",
     "https://gph.is/1ae9Gz2",
     "https://gph.is/1sFD3oq",
     "https://gph.is/1maDs7Q",
     "https://gph.is/JBiiE4"
     
										];

   var result = Math.floor((Math.random() * sayings.length) + 0);
    message.channel.send(sayings[result]);
   
}
  //highfives
  if(command==="highfive") {
    var member = message.mentions.members.first();
if (!member) return message.channel.send(":no_entry_sign: You need to **Mention** someone :face_palm:");
   message.reply(` highfived ${member.user} :raised_hands: `);
   var sayings = [
										"http://gph.is/1f40vns",
                    "http://gph.is/XMGoAm",
     "https://gph.is/1ypm1wD",
     "https://gph.is/2pNx4fL"
                       
										];

   var result = Math.floor((Math.random() * sayings.length) + 0);
    message.channel.send(sayings[result]);
   
}
  //kill
  if(command==="kill") {
    var member = message.mentions.members.first();
if (!member) return message.channel.send(":no_entry_sign: You need to **Mention** someone :face_palm:");
   message.reply(` brutally murdered ${member.user} :scream: `);
   var sayings = [
			"http://gph.is/XLi6Hc",
      "http://gph.is/Z0CBLK",
     "http://gph.is/1YPG6n3",
     "http://gph.is/XIX2B7",
     "https://gph.is/1SFQfCa",
     "https://gph.is/XKysQk",
     "https://gph.is/1JUVeLx",
     "https://gph.is/1ac9DUy",
     "https://gph.is/1GaKUta",
     "https://gph.is/13vzDAe"
										];

   var result = Math.floor((Math.random() * sayings.length) + 0);
    message.channel.send(sayings[result]);
   
}
//hug
  if(command==="hug") {
    var member = message.mentions.members.first();
if (!member) return message.channel.send(":no_entry_sign: You need to **Mention** someone :face_palm:");
   message.reply(` hugged ${member.user} :hugging:  `);
   var sayings = [
			"http://gph.is/1fI8t5J",
      "http://gph.is/1dCedvY",
      "http://gph.is/1aemFkj",
      "http://gph.is/XLbrwu",
      "https://gph.is/28ZYTyu",
      "https://gph.is/1dCdZFk",
      "https://gph.is/KuOysl",
      "https://gph.is/XJHD3t",
      "https://gph.is/XJcVY0",
      "https://gph.is/1CsGjSC",
      "https://gph.is/XIDDjE"
   
										];

   var result = Math.floor((Math.random() * sayings.length) + 0);
    message.channel.send(sayings[result]);
   
}
  //clapify
  const randomizeCase = word => word.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');

if(command==="clapify") {
    if (args.length < 1) return message.channel.send("Wrong syntax..provide some text to clapify..")
    
    message.channel.send(args.map(randomizeCase).join(':clap:'));

    message.delete();

}
//uni
  if(command==="unicode") {
  
  if (args[0] === undefined) {
      
    return message.channel.send('Wrong syntax..Enter a **character** to get its unicode...');

  } else {

    let transArg = args[0].toLowerCase();

    if (transArg === undefined) {

      return message.channel.send('Only provide **1** character to get the unicode from!');

    } else {

      if (transArg.length >= 2) {

        return message.channel.send(`Wrong syntax.. ${message.author}, you can only type **1** character to get its unicode`);

      }

      const embed = new Discord.RichEmbed()
      .setDescription(`The unicode of ${transArg} is ${transArg.charCodeAt(0)}`);

      return message.channel.send(embed);

    }

  }
  
}
  let SteamRepAPI = require('steamrep');

if(command==="steamrep"){

    SteamRepAPI.timeout = 5000;
     
    let userID = args[0]
if(!userID) return message.channel.send("Wrong syntax..provide steamid64 of a user.!");
    SteamRepAPI.isScammer(userID, function(error, result) {
      if(error) {
        console.log(error);
      } else {
        if(result) {
          message.channel.send("This user is tagged as 'SCAMMER' on SteamRep.");
        } else {
            console.log(userID);
        }
      }
    });
     
    SteamRepAPI.getProfile(userID, function(error, result) {
      if(error === null) {

        let data = result.steamrep

        let custurl = data.customurl
        let vac = data.vacban
        let name = data.displayname
        let avatar = data.avatar
        let trdban = data.tradeban
        let srurl = data.steamrepurl
        let id64 = data.steamID64
        let id32 = data.steamID32
        let rept = data.reputation

        let embed = new Discord.RichEmbed()
        .setColor("#00ff00")
        .setTitle(`${name}`)
        .setAuthor(`Steam Rep information about: ${name}`)
        .setURL(srurl)
        .setThumbnail(avatar)
        .addField(":spy: Nickname", name, true)
        //.addField(":link: Custom URL", `>>${custurl}`)
        .addField(":link: Custom URL", `>>http://steamcommunity.com/id/${custurl}`)
        .addField(":bangbang: VacBans", `>> **${vac}**`, true)
        .addField(":handshake: TradeBans", `>> **${trdban}**`, true)
        .addField(":id: SteamID64", `>>${id64}`, true)
        .addField(":id: SteamID32", `>>${id32}`, true)
        .addField(":man_in_tuxedo: Steam Profile", `>>[Steam Profile](http://steamcommunity.com/profiles/${id64})`, true)
        .addField(":man_with_gua_pi_mao: SteamRep Profile",  `>>[Steam Rep Profile](${srurl})`, true)
        .setFooter("Command usage k!steamrep <steamid64>")

        message.channel.send(embed);

        message.delete()

      };
    });


}
  //reversecommand
  if(command==="reverse") {
    if (args.length < 1) {
        return message.reply( 'Wrong syntax..provide some text to reverse..');
    }
    message.reply(args.join(' ').split('').reverse().join(''));


}
  //mockcommand
const randomizeCase2 = word => word.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');

if(command==="mock") {
    if (args.length < 1) return message.channel.send("Please provide some text to Mock")

    let mockEmbed = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setDescription(args.map(randomizeCase2))
    .setImage("https://cdn.discordapp.com/attachments/424889733043191810/425242569325150208/mock.jpg")

    message.channel.send(mockEmbed)

    message.delete();

}
//
  const hastebin = require('hastebin-gen');

if(command==="hastebin"){

     let haste = args.slice(0).join(" ")

        let type = args.slice(1).join(" ")

        if (!args[0]) { return message.channel.send("Wrong Syntax..provide some input to upload on Hastebin?") }

        hastebin(haste).then(r => {

            message.reply("`Posted to Hastebin at this URL:`  " + r);

        }).catch(console.error);

        message.delete();

}    
  //test
  if(command==="roleinfo") {
    let inline = true
    let role = args.join(` `)
    if(!role) return message.reply("Wrong syntax..specify a role name...");
    let gRole = message.guild.roles.find(`name`, role);
    if(!gRole) return message.reply("Couldn't find that role..");

    const status = {
        false: "No",
        true: "Yes"
      }

    let roleemebed = new Discord.RichEmbed()
    .setColor("#00ff00")
    .addField("RoleID", `**>> ${gRole.id}**` )
    .addField("RoleName", `**>> ${gRole.name}**`)
    .addField("Color", `**>> ${gRole.hexColor}**`,inline)
    .addField("Members", `**>> ${gRole.members.size}**`, inline)
    .addField("Position", `**>> ${gRole.position}**`, inline)
    .addField("Mentionable", `**>> ${status[gRole.mentionable]}**`, inline)
    .addField("Hoisted", `**>> ${status[gRole.hoist]}**`, inline)
    .addField("Managed", `**>> ${status[gRole.managed]}**`, inline)
    
    message.channel.send(roleemebed);

}
  //pepecommand
  if(command==="pepe" ){

    let pepe1 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556352915505165.png?v=1");

    let pepe2 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556326482739230.png?v=1");

    let pepe3 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556486235389973.png?v=1");

    let pepe4 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556308929576960.png?v=1");

    let pepe5 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556295218659329.png?v=1");

    let pepe6 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556467021545473.png?v=1");

    let pepe7 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556448507625474.png?v=1");

    let pepe8 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556377754042378.png?v=1");

    let pepe9 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556281767526405.png?v=1");

    let pepe10 = new Discord.RichEmbed()
    .setColor("#00ff00")
    .setImage("https://cdn.discordapp.com/emojis/428556266366042112.png?v=1");

    let pepes = [pepe1, pepe2, pepe3, pepe4, pepe5, pepe6, pepe7, pepe8, pepe9, pepe10]

    let dapepe = Math.floor((Math.random() * pepes.length));

    message.channel.send(pepes[dapepe])

}
  //finduser
   if(command==="finduser") {
    let users = client.users;

    let searchTerm = args[0];
    if(!searchTerm) return message.channel.send("Wrong syntax..provide an input to search..");

    let matches = users.filter(u => u.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    message.channel.send(matches.map(u => u.tag));
   message.delete();

     }
//csgo
var request = require('request');
var cheerio = require('cheerio');

function getStatData(location , $){
  
    var selector = $('.stats-stat .value').eq(location).text();
  
    var stat_array = $.parseHTML(selector);
  
    var stat = 0;
  
    if(stat_array == null || stat_array.lengh == 0){
      return -1;
      
    }else{
      stat = stat_array[0].data;
    }
  
    return stat;
  }  

if(command==="csgo"){

  var UR_L = "http://csgo.tracker.network/profile/" + args[0];
  
          if(!args[0]){
            return message.channel.send("Please Enter a valid STEAMID64 or custom url");
          }
  
          request(UR_L, function(err, resp, body){
  
              $ = cheerio.load(body);
  
              var KD = getStatData(0, $);
              if(KD == -1){
                message.channel.send("Invalid, make sure your profile is not private and you have entered a valid STEAMID64 or Custom URL!");
                return;
              }

              var WIN = getStatData(1, $);
              var HS = getStatData(4, $);
              var MONEY = getStatData(5, $);
              var SCORE = getStatData(6, $);
              var KILLS = getStatData(7, $);
              var DEATHS = getStatData(8, $);
              var MVP = getStatData(9, $);
              var BS = getStatData(13, $);
              var BD = getStatData(14, $);
              var HR = getStatData(15, $);
  
              var STAT = new Discord.RichEmbed()
  
              .setTitle("__***CSGO Stats***__")
              .setURL(UR_L)
  
              .addField("------------------------------------",
                        "Total KD: " + "__**" + KD + "**__" + "\n" +
                        "Total Win%: " + "__**" + WIN + "**__" + "\n" +
                        "Total MVPs: " + "__**" + MVP + "**__" + "\n" +
                        "Total Score: " + "__**" + SCORE + "**__" + "\n" +
                        "Total Kills: " + "__**" + KILLS + "**__" + "\n" +
                        "Total Deaths: " + "__**" + DEATHS + "**__" + "\n" +
                        "Total Bombs Set: " + "__**" + BS + "**__" + "\n" +
                        "Total Bombs Defused: " + "__**" + BD + "**__" + "\n" +
                        "Total Headshots: " + "__**" + HS + "**__" + "\n" +
                        "Total Money Earned: " + "__**" + MONEY + "**__" + "\n" +
                        "Total Hostages Rescued: " + "__**" + HR + "**__" + "\n" +
                        "------------------------------------\n", true)
  
                .setColor("0x#FF0000")
              message.channel.send(STAT);

  })
}
//high
  if(command==="rep"){
    message.delete();
    if(args[0] == "help"){
      message.reply("Usage: /report <user> <reason>");
      return;
    }
    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.send("Invalid user...");
    let rreason = args.join(" ").slice(22);
    if(!rreason) return message.channel.send("no reason given");

    let reportEmbed = new Discord.RichEmbed()
    .setDescription("Reports")
    .addField("Reported User", `${rUser}  ID: ${rUser.id}`)
    .addField("Reported By", `${message.author}  ID: ${message.author.id}`)
    .addField("Channel", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", rreason);

    let reportschannel = message.guild.channels.find(`name`, "reportss");
    if(!reportschannel) return message.channel.send("Couldn't find reports channel.");
    reportschannel.send(reportEmbed);

}
  

});

client.login(config.token);

