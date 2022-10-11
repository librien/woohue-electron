import axios from 'axios';
import { format } from 'date-fns';

export const getAllTeams = () => {
  return axios.get("https://statsapi.web.nhl.com/api/v1/teams").then(response => {
    return response.data.teams;
  });
}

export const getTeam = (id: number) => {
  return axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${id}`).then(response => {
    return response.data.teams[0];
  })
}

export const getNextGame = (id: number) => {
  return axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.schedule.next`).then(response => {
    return response.data.teams[0];
  });
}

export const getCurrentGames = () => {
  const date = format(new Date(), 'MM/dd/yyy')
  return axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${date}&endDate=${date}&expand=schedule.teams,schedule.linescore`).then(response => {
    return response.data.dates[0]?.games;
  })
}
