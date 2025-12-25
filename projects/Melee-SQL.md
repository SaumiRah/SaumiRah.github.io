SQL Project: Super Smash Bros. Melee
================
## Summary
- This is a SQL project focused on measuring and improving my performance in a fighting game.
- [Click here to skip to SQL queries](#section-iii-sql-queries)
- Queries used: 
    ```SQL
    WITH... AS (AKA CTEs)
    WHERE... (AND...)
    HAVING
    ROUND
    SUM
    COUNT
    GROUP BY
    ORDER BY
    CASE... (WHEN... THEN... END)
    CAST
    LEFT JOIN
    STRFTIME
    DATE
    TIME
    BETWEEN
    ```

## Table of Contents
- [SQL Project: Super Smash Bros. Melee](#sql-project-super-smash-bros-melee)
  - [Summary](#summary)
  - [Table of Contents](#table-of-contents)
  - [Section I. Research Questions](#section-i-research-questions)
  - [Section II. Data Collection](#section-ii-data-collection)
  - [Section III. SQL Queries](#section-iii-sql-queries)
    - [1. How many games have I played using "Falco"?](#1-how-many-games-have-i-played-using-falco)
    - [2. What are my best and worst matchups?](#2-what-are-my-best-and-worst-matchups)
    - [3. What are my best and worst stages?](#3-what-are-my-best-and-worst-stages)
    - [4. What are my best and worst matchups on each stage?](#4-what-are-my-best-and-worst-matchups-on-each-stage)
    - [5. When do I play best?](#5-when-do-i-play-best)
      - [5.1. Day of the Week](#51-day-of-the-week)
      - [5.2. Time of Day](#52-time-of-day)
      - [5.3. Day of the Week and Time of Day](#53-day-of-the-week-and-time-of-day)
  - [Section IV. Interpretation and Key Insights](#section-iv-interpretation-and-key-insights)
    - [Key Insights](#key-insights)
    - [Matchups](#matchups)
    - [Stages](#stages)
    - [Day of Week/Time of Day](#day-of-weektime-of-day)


## Section I. Research Questions

[Super Smash Bros. Melee](https://en.wikipedia.org/wiki/Super_Smash_Bros._Melee) (hereon, “Melee”) is a fighting game for the Nintendo GameCube, which was released on November 21st, 2001. More than two decades later, people are still playing Melee. More specifically, the game's competitive community is thriving despite the game's age. How could such an old game still have such an active fan base? **Slippi**. Slippi is an ongoing modding project by members of the Melee community which aims to render several major quality-of-life additions to the game. The two most major changes were rollback netcode and an integrated online matchmaking system. I started playing Melee in 2023 after hearing about this modding project and have been playing since.

In addition to these two features, another interesting addition the Slippi team made was an automatic replay saving feature, which saves a replay of every match of Melee you play online. The replay files are stored right onto the device running Slippi as a .slp file, which can be viewed through the Slippi launcher. What’s interesting about these files are that they are laden with *data*. By passing the replay files through a parsing program, we can view all sorts of data: Player characters and names, the winner of each game, the date and time of each game, the stage played on…

The goal of this project is to kill two birds with one stone: get better at SQL and Melee. By parsing my replay files, and placing them into a database, I can practice writing SQL scripts that pull key insights about my gameplay out of my replay database. Once I have these key insights, I can determine my strengths and weaknesses and adapt my playstyle accordingly in-game.

It’s also important to mention that there are many different characters to play in Melee, but most players pick one character and stick to them. In my case, I’m interested in playing [Falco](https://ssb.wiki.gallery/images/thumb/e/e0/Falco_Idle_Pose_Melee_1.gif/200px-Falco_Idle_Pose_Melee_1.gif).

Given that, these are the questions I wanted answered:

> 1. **How many games** have I played on Falco? 
>       - Count of games on Falco.
> 2.  What are my best and worst **matchups**?
>       - Average win-rate vs every character.
> 3. What are my best and worst **stages**?
>       - Average win-rate on every stage.
> 4. What are my best and worst **matchups on each stage**?
>       - Average win-rates on every matchup-stage combination.
> 5. **When** do I play best? 
>       - Average win-rate on every day of the week.
>       - Average win-rate at different times of day (e.g. Morning)
>       - Average win-rate on every day of the week and at every time of day. 

## Section II. Data Collection

I used [Slippi DB](https://github.com/mtimkovich/slippi-db) to parse replay files and place them into a SQLite database.

I've been accumulating replays over the course of approximately a year (since I started playing in 2023). 

> Total number of replays: 3313 

## Section III. SQL Queries

### 1. How many games have I played using "Falco"?
```SQL
-- Starting by filtering down to only the games where I play Falco
WITH
falco_games AS (
    select
        me.character as bird 
    from players me, players op 
    where me.id != op.id -- x /= y (there are two unique objects in the domain)
    and me.game_id = op.game_id -- Gxy & Gyx (One object is in the same game as the other, and vice versa)
    and me.character='FALCO' -- Cx'Falco'  (One object has the property of playing Falco)
    and me.code='FROG#671' -- Ox'FROG#671' (That object also has my specific code)
) 
select bird as Character, count(*) as "Games played" -- Counting Games
FROM falco_games;
```
Output:
|Character|Games played                 |
|---------|-----------------------------|
|FALCO    |2332                         |

### 2. What are my best and worst matchups?
```SQL
WITH
falco_games AS (
    select me.id, 
        me.game_id, 
        op.character as matchups, 
        me.winner as didIwin
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
select matchups as 'Matchups',
    round((sum(didIwin)*1.0 /count(*)*100), 1) as Winrate, 
    -- Winrate: The percetentage of time I win...
    count(*) as 'Games played'
FROM falco_games
GROUP BY matchups                                           -- ... each matchup
ORDER BY Winrate desc;
```
Output, ordered by `Winrate`:

|Matchups|Winrate                      |Games played|
|--------|-----------------------------|------------|
|MEWTWO  |66.7                         |9           |
|GAME_AND_WATCH|66.7                         |12          |
|BOWSER  |66.7                         |3           |
|YOUNG_LINK|63.6                         |11          |
|ROY     |60                           |15          |
|PIKACHU |57.1                         |14          |
|SAMUS   |56.7                         |30          |
|CAPTAIN_FALCON|54.7                         |338         |
|MARIO   |52.9                         |34          |
|DONKEY_KONG|52.9                         |51          |
|SHEIK   |52.8                         |159         |
|FOX     |51.3                         |392         |
|FALCO   |48.7                         |622         |
|YOSHI   |46.2                         |13          |
|NESS    |45.5                         |11          |
|LUIGI   |45.5                         |44          |
|MARTH   |44.9                         |365         |
|KIRBY   |42.9                         |7           |
|ZELDA   |40                           |5           |
|GANONDORF|34.2                         |76          |
|LINK    |33.3                         |21          |
|ICE_CLIMBERS|33.3                         |6           |
|PEACH   |31.3                         |48          |
|JIGGLYPUFF|27.3                         |33          |
|DR_MARIO|25                           |12          |
|PICHU   |0                            |1           |

### 3. What are my best and worst stages?
```SQL
WITH
falco_games AS (
    select me.id, 
        me.game_id as gid, 
        me.winner as winner
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
select stage as Stage,
   round((sum(winner)*1.0/count(*)*100),1) as Winrate,
    count(*)
From falco_games
LEFT JOIN games on gid = games.id --Left joining with games to get stage data
GROUP BY Stage
HAVING count(*) > 10 -- Ignore games on stages I've played less than 10 times
ORDER BY Winrate desc;
```
Output, ordered by `Winrate`:
|Stage|Winrate                      |count(*)|
|-----|-----------------------------|--------|
|FINAL_DESTINATION|52.6                         |382     |
|POKEMON_STADIUM|52.4                         |393     |
|FOUNTAIN_OF_DREAMS|47.7                         |392     |
|YOSHIS_STORY|46.8                         |389     |
|DREAM_LAND_N64|46.6                         |371     |
|BATTLEFIELD|46.1                         |399     |

### 4. What are my best and worst matchups on each stage?
```SQL
WITH
falco_games AS (
    select me.id as mid, 
        me.game_id as gid,  
        op.character as matchup, 
        me.winner as winner
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
Select stage as Stage, matchup,
    round((sum(winner)*1.0/count(*)*100), 1) as Winrate,
    count(*)
From falco_games
LEFT JOIN games on gid = games.id
GROUP BY Stage, matchup
HAVING count(*) >= 10 -- filtering out stage-matchup combinations that I have played on/against less than 10 times
ORDER BY Winrate desc;
```
Output, ordered by `Winrate`:
|Stage|matchup                      |Winrate|count(*)|
|-----|-----------------------------|-------|--------|
|YOSHIS_STORY|DONKEY_KONG                  |70     |10      |
|FINAL_DESTINATION|SHEIK                        |62.5   |32      |
|BATTLEFIELD|CAPTAIN_FALCON               |61.3   |62      |
|POKEMON_STADIUM|FOX                          |61.3   |62      |
|FOUNTAIN_OF_DREAMS|CAPTAIN_FALCON               |60.3   |58      |
|POKEMON_STADIUM|LUIGI                        |60     |10      |
|BATTLEFIELD|SHEIK                        |57.1   |28      |
|FOUNTAIN_OF_DREAMS|SHEIK                        |57.1   |21      |
|FINAL_DESTINATION|MARTH                        |56.3   |64      |
|FINAL_DESTINATION|FOX                          |55.1   |69      |
|YOSHIS_STORY|CAPTAIN_FALCON               |54.4   |57      |
|FINAL_DESTINATION|FALCO                        |53.8   |93      |
|DREAM_LAND_N64|CAPTAIN_FALCON               |53.7   |54      |
|POKEMON_STADIUM|FALCO                        |53.7   |108     |
|POKEMON_STADIUM|SHEIK                        |51.9   |27      |
|FINAL_DESTINATION|GANONDORF                    |50     |14      |
|FOUNTAIN_OF_DREAMS|MARTH                        |50     |54      |
|POKEMON_STADIUM|CAPTAIN_FALCON               |50     |52      |
|YOSHIS_STORY|FOX                          |48.5   |66      |
|DREAM_LAND_N64|FOX                          |48.1   |54      |
|DREAM_LAND_N64|FALCO                        |47.4   |97      |
|FINAL_DESTINATION|CAPTAIN_FALCON               |47.3   |55      |
|BATTLEFIELD|FALCO                        |47.1   |102     |
|FOUNTAIN_OF_DREAMS|FOX                          |47     |66      |
|BATTLEFIELD|FOX                          |46.6   |73      |
|YOSHIS_STORY|FALCO                        |45.7   |105     |
|BATTLEFIELD|PEACH                        |45.5   |11      |
|FOUNTAIN_OF_DREAMS|FALCO                        |45.3   |117     |
|DREAM_LAND_N64|SHEIK                        |44.8   |29      |
|DREAM_LAND_N64|GANONDORF                    |43.8   |16      |
|POKEMON_STADIUM|MARTH                        |43.5   |69      |
|YOSHIS_STORY|MARTH                        |41.7   |60      |
|YOSHIS_STORY|SHEIK                        |40.9   |22      |
|DREAM_LAND_N64|MARTH                        |39.7   |58      |
|BATTLEFIELD|MARTH                        |39     |59      |
|FOUNTAIN_OF_DREAMS|GANONDORF                    |36.4   |11      |
|DREAM_LAND_N64|DONKEY_KONG                  |30     |10      |
|YOSHIS_STORY|GANONDORF                    |28.6   |14      |
|POKEMON_STADIUM|GANONDORF                    |27.3   |11      |
|BATTLEFIELD|GANONDORF                    |10     |10      |

### 5. When do I play best? 
#### 5.1. Day of the Week
```SQL
WITH
falco_games AS (
    select me.id as mid, 
        me.game_id as gid, 
        me.winner as winner
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
select
CASE CAST (strftime('%w', DATE(start_time)) as int)   --strftime(%w,...) to get the day of the week based on the date of the game
    WHEN 0 then 'Sunday'-- Instead of expressing each day of week as an integer (sunday=0... saturday=6), strings
    WHEN 1 then 'Monday'
    WHEN 2 then 'Tuesday'
    WHEN 3 then 'Wednesday'
    WHEN 4 then 'Thursday'
    WHEN 5 then 'Friday'
    else 'Saturday' end as "Day of Week",
    round((sum(winner)*1.0/count(*)*100), 1) as Winrate,
    count(*) as Games
From falco_games
LEFT JOIN games on gid = games.id
GROUP BY 1
ORDER BY Winrate desc;
```
Output, ordered by `Winrate`:

|Day of Week|Winrate                      |Games|
|-----------|-----------------------------|-----|
|Wednesday  |52.3                         |369  |
|Thursday   |50.9                         |379  |
|Saturday   |48.1                         |318  |
|Tuesday    |47.5                         |396  |
|Monday     |47.4                         |388  |
|Friday     |47.2                         |299  |
|Sunday     |46.4                         |183  |

#### 5.2. Time of Day
```SQL
WITH
falco_games AS (
    select me.id as mid, 
        me.game_id as gid, 
        me.winner as winner
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
select 
    CASE -- Defining different times of the day based on the hour of the day
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 0 AND 5 THEN 'Late Night (12AM-5AM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 5 AND 9 THEN 'Morning (5AM-9AM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 9 AND 14 THEN 'Noon (9AM-2PM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 14 AND 19 THEN 'Afternoon (2PM-7PM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) >= 19 THEN 'Evening (7PM-12AM)'
    END AS "Time of Day",
    round((sum(winner)*1.0/count(*)*100), 1) as Winrate,
    count(*) as "Games Played"
From falco_games
LEFT JOIN games on gid = games.id
GROUP BY 1
ORDER BY CASE -- Aesthetic reordering so 'Morning' comes first, and 'Late Night' comes last
    WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 0 AND 5 THEN 5
    WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 5 AND 9 THEN 1
    WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 9 AND 14 THEN 2
    WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 14 AND 19 THEN 3
    WHEN CAST (strftime('%H', TIME(start_time)) as int) >= 19 THEN 4
END;
```
Output, ordered by `Winrate`:
|Time of Day|Winrate                      |Games Played|
|-----------|-----------------------------|------------|
|Morning (5AM-9AM)|47.8                         |370         |
|Noon (9AM-2PM)|61.5                         |13          |
|Afternoon (2PM-7PM)|48.6                         |210         |
|Evening (7PM-12AM)|46.2                         |650         |
|Late Night (12AM-5AM)|50.5                         |1089        |

#### 5.3. Day of the Week and Time of Day
```SQL
WITH
falco_games AS (
    select me.id as mid, 
        me.game_id as gid, 
        me.winner as winner
    from players me, players op 
    where me.id != op.id
    and me.game_id = op.game_id
    and me.character='FALCO'
    and me.code='FROG#671'
)
select
    CASE CAST (strftime('%w', DATE(start_time)) as int) 
        WHEN 0 then 'Sunday'
        WHEN 1 then 'Monday'
        WHEN 2  then 'Tuesday'
        WHEN 3 then 'Wednesday'
        WHEN 4 then 'Thursday'
        WHEN 5 then 'Friday'
        else 'Saturday' 
    END as 'Day of Week',
    CASE 
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 0 AND 5 THEN 'Late Night (12AM-5AM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 5 AND 9 THEN 'Morning (5AM-9AM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 9 AND 14 THEN 'Noon (9AM-2PM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) BETWEEN 14 AND 19 THEN 'Afternoon (2PM-7PM)'
        WHEN CAST (strftime('%H', TIME(start_time)) as int) >= 19 THEN 'Evening (7PM-12AM)'
    END AS 'Time of Day',
    round((sum(winner)*1.0/count(*)*100), 1) as Winrate,
    count(*) as Games
From falco_games
LEFT JOIN games on gid = games.id
GROUP BY 1, 2
HAVING Games >= 10
ORDER BY Winrate desc;
```
Output, ordered by `Winrate`:
|Day of Week|Time of Day                  |Winrate|Games|
|-----------|-----------------------------|-------|-----|
|Thursday   |Late Night (12AM-5AM)        |56     |184  |
|Wednesday  |Afternoon (2PM-7PM)          |56     |75   |
|Wednesday  |Evening (7PM-12AM)           |55.1   |78   |
|Monday     |Morning (5AM-9AM)            |54.5   |33   |
|Sunday     |Afternoon (2PM-7PM)          |54.5   |11   |
|Tuesday    |Morning (5AM-9AM)            |53.3   |15   |
|Tuesday    |Afternoon (2PM-7PM)          |53.1   |32   |
|Saturday   |Late Night (12AM-5AM)        |52.4   |187  |
|Wednesday  |Late Night (12AM-5AM)        |52.4   |126  |
|Monday     |Late Night (12AM-5AM)        |50     |184  |
|Saturday   |Morning (5AM-9AM)            |50     |32   |
|Wednesday  |Noon (9AM-2PM)               |50     |10   |
|Sunday     |Morning (5AM-9AM)            |49.4   |89   |
|Friday     |Morning (5AM-9AM)            |48.8   |43   |
|Friday     |Afternoon (2PM-7PM)          |47.5   |40   |
|Tuesday    |Late Night (12AM-5AM)        |47.1   |261  |
|Friday     |Late Night (12AM-5AM)        |46.9   |98   |
|Friday     |Evening (7PM-12AM)           |46.6   |118  |
|Wednesday  |Morning (5AM-9AM)            |46.3   |80   |
|Thursday   |Evening (7PM-12AM)           |46.2   |106  |
|Tuesday    |Evening (7PM-12AM)           |45.5   |88   |
|Sunday     |Late Night (12AM-5AM)        |44.9   |49   |
|Saturday   |Evening (7PM-12AM)           |44.7   |76   |
|Monday     |Evening (7PM-12AM)           |44     |150  |
|Thursday   |Morning (5AM-9AM)            |42.3   |78   |
|Sunday     |Evening (7PM-12AM)           |38.2   |34   |
|Monday     |Afternoon (2PM-7PM)          |38.1   |21   |
|Saturday   |Afternoon (2PM-7PM)          |21.7   |23   |


## Section IV. Interpretation and Key Insights
### Key Insights
> - I need practice against Jigglypuff.
> - I need practice on Battlefield.
> - Counterpick to Final Destination against Sheik, Marth and Fox.
> - Avoid Battlefield against Marth, Peach, Fox and Falco.
> - Against Captain Falcon, counterpick to Battlefield and avoid Final Destination.
### Matchups
First, looking at my matchup win-rates, we can see that my best matchups are against Mewtwo, Bowser, and Game and Watch. This makes sense because these characters are generally considered weak characters according to the [community tier-list]( https://images.ctfassets.net/er5eblldu1i7/1w88iRq70og23WAFYzyjYg/22644ad3b6cc6719dead307c52a6f53d/13TH_MELEE_TIERLIST.png) (i.e., a “low-tier” character), which also explains why I’ve played against so few of them. Compare this to someone like Captain Falcon, who I’ve played against many more times (n=338). My matchups against high-tiers generally matter more than against non-high-tiers, simply because more people play them.

My highest win-rate against a “high-tier” character is 54.7% against Captain Falcon, and my lowest is 27.3% against Jigglypuff. This suggests that I need more practice against Jigglypuff, and that I’m well practiced against Captain Falcon.

### Stages
Looking at my stage win-rates, it’s interesting to see that Final Destination is my best stage. Traditional wisdom suggests Falco, my character, is *bad* on Final Destination. This is bizarre, but situationally advantageous when counter-picking a stage in tournament. [^1] Looking at my stage-matchup win-rates, I am more than 50% likely to beat Sheik, Marth and Fox on Final Destination, who all generally like to counterpick to Final Destination. However, my win-rate against Captain Falcon is losing on Final Destination at 47.3%. So, if I beat Sheik, Marth or Fox in game 1, they might unknowingly counterpick my best stage. If I lose in game 1, I know to counterpick to Final Destination, **unless I’m playing against Captain Falcon.**

Furthermore, Battlefield is my worst stage, which according to traditional wisdom should be one of Falco’s *best* stages. Looking at my stage-matchup win-rates, I can see that I am more likely to lose on Battlefield against Marth, Peach, Fox, and Falco. So, **I should avoid Battlefield against Marth, Peach, Fox and Falco** whenever possible. But funnily enough, Captain Falcon is again the exception. My win-rate against Captain Falcon on Battlefield is my third best mathcup at 61.3%. So, **I should pick Battlefield against Captain Falcon.**

### Day of Week/Time of Day
I was very surprised to see that I play the best on Wednesdays. This was also reflected in the Day of the Week - Time of Day win-rates, where my top 3 performances were on varying times on Wednesday. [^2] I can only speculate, but I suspect this outcome is a result of my and other people’s work schedules. For around a year Wednesdays were my day off, which gave me more time to relax and play Melee. Generally, people don’t have Wednesdays off, so my opponents were probably suffering from the stress of work on Wednesdays. I believe it was a combination of my atypical and other people’s typical work schedule. This simply suggests that stress makes people perform worse in Melee.

[^1]: Tournament sets are usually best out of 3. Rock, Paper, 
    Scissors determines who picks the stage for the first game. The loser of the first game gets to pick the stage for the second game. The strategy of picking a stage that favors your character over the opponent’s is called counter-picking.

[^2]: Thursday at 12-5AM is my highest winrate day-hour, which is
     technically a calendar-Thursday. However, it’s better to interpret it as a Wednesday play session.