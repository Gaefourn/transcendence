import * as achievements from 'src/achievements.json'

export interface Achievement {

  goal: number;

  date?: Date;

  level: number;

}

export interface Category {

  counter: number;

  name: string;

  achievements: Achievement[];

}

export const AchievementList: Category[] = achievements.map(elem => {
  return { name: elem.name, counter: 0, achievements: elem.achievements.map((e, rank) => {
    return { goal: e.progressMax, date: null, level: rank };
  })};
});

