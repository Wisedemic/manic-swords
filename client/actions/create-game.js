import model from '../models/GameModel'
import { history } from '../store'

export const GAME_CREATED = 'GAME_CREATED'

export default () => {
  return dispatch => {
    model.dispatch = dispatch
    model.service.on('created', (resource) => {
      return history.push(`/game/${resource._id}`)
    })
    model.app.authenticate()
      .then((response) => {
        model.create()
    }).catch((error) => {
      console.log(error)
    })
  }
}


export function createGame(game) {
  return {
    type: GAME_CREATED,
    payload: game
  }
}
