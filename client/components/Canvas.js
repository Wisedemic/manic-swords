import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import saveGame from '../actions/update-game'
import './Canvas.sass'

// the Scoreboard
import Scoreboard from '../containers/Scoreboard'

// helpers
import { updatePlayer, currentPlayer, otherPlayer } from '../helpers/update-player-helper'
import { checkCollision, cleanDisabledSword } from '../helpers/game-helper'

// models [still empty]
import Player from '../models/PlayerModel'
import Sword from '../models/SwordModel'

const WIDTH = 800
const HEIGHT = 550
let clientSwords = []
let titles = [
  '',
  'Air of war',
  'Winter is coming',
  'Prepare for war',
  'Swords madness',
  'Massive blood',
  'The End',
]
let SPEED = 0

class Canvas extends React.Component {

    componentWillMount(){
      const { swords, level } = this.props.game
      SPEED = 0
      SPEED = level.speed
      clientSwords = swords.map((sword) => {
        return new Sword(sword, level)
      })
    }

    // we bind addEventListener to update the player position
    // when the component has mounted
    componentDidMount() {
       // we draw the players for the first time
       const { game, saveGame } = this.props
      this.drawPlayers()
      window.addEventListener( 'keydown', function(event) {
        updatePlayer(this, event)
      }.bind(this))

      setInterval(function () {
        saveGame(game, {level: { speed: SPEED, title: titles[SPEED] }, swords: clientSwords})
        console.log('level changed')
      }, 30000);
      // here we trigger the draw function for the first time
      // we should call this at least once to start the loop
      // to continuously trigger the drawPlayer and drawSwords functions
      this.drawPlayers()
      this.draw()
      // we also trigger the updateSwords function loop for the first time
      // also when there is no playerTwo yet...
      this.updateSwords()
    }
    // Update swords when the hit something
    componentDidUpdate() {
      const { game } = this.props

      if(SPEED < 5){ SPEED = game.level.speed + 1 }
      if(game.started){
        // this.startCleaning.bind(this)()
      }
    }


    // taking changes from this commit in branch optimizing:
    // https://github.com/giuliogallerini/manic-swords/commit/b4d238bf55d12ce484604e3a5e8e21a4d4df87b7

    //TODO are the swords updated now?
     updateSwords() {
     const { game, saveGame, currentUser } = this.props

     const { playerOne, playerTwo } = game
     const player1 = currentPlayer(this)
     console.log('updateSwords: isdead?')
     debugger
       if(!player1.isDead) {
         window.setTimeout(function(){
           const collided = checkCollision(clientSwords, player1)

           if(collided.player.hasOwnProperty('isHit')){
              const snd = new Audio('../audio/hit.wav')
              snd.play()
              clientSwords = collided.swords
              console.log('collided!')
              if (currentUser._id === playerOne.userId) {
                saveGame(game, {swords: clientSwords, playerOne: { lifes: collided.player.lives-- } })
              }
              if (currentUser._id === playerTwo.userId) {
                saveGame(game, {swords: clientSwords, playerTwo: { lifes: collided.player.lives-- } })
              }
          }
          // we maken sure to feed the function back to itself
          // so that we check for collisions and update the swords a couple times a second
          // the timeframe cannot be to small, because that's too expensive
          this.updateSwords()
        }.bind(this), 300)
      }
    }

    // we continuously draw all swords and players
    draw(){
      const { game, saveGame, currentUser } = this.props
      const { playerOne, playerTwo } = game

      const ctx = this.refs.canvas.getContext('2d')
      ctx.clearRect(0,0,WIDTH,HEIGHT)

      if(game.started && !game.ended) this.drawSwords()

      this.drawPlayers()

      window.requestAnimationFrame(this.draw.bind(this))
    }

    // this is how we draw swords
    drawSwords() {
      const ctx = this.refs.canvas.getContext('2d')
      const swordImg = new Image()
      clientSwords.map((sword) => {
        // the falling class function increments the y-coordinates
        // of the swords each time we draw
        sword.falling(SPEED)
        if(sword.active && sword.position.y > 0 ){
          swordImg.src = sword.image
          ctx.drawImage(swordImg, sword.position.x, sword.position.y)
        }
      })
    }

    // this is how we draw players
    drawPlayers() {
        const { playerOne, playerTwo } = this.props.game
        const ctx = this.refs.canvas.getContext('2d')

        if(!playerOne.isDead) {
          const puppet1 = new Image()
          puppet1.src = playerOne.puppet

          ctx.drawImage(puppet1, playerOne.position.x, playerOne.position.y)
        }

        if( !playerTwo || playerTwo.isDead){ return }

        const puppet2 = new Image()
        puppet2.src = playerTwo.puppet

        ctx.drawImage(puppet2, playerTwo.position.x, playerTwo.position.y)

    }

    render() {
      const { game } = this.props
        return (
          <div>
            <Scoreboard className='scoreboard'/>
            <div className="canvas-container">
              {game.ended ? <div className="game-over"><h1>GAME OVER</h1></div> : null }
              <canvas ref="canvas" width={WIDTH} height={HEIGHT} />
            </div>
          </div>
        )
    }
}

// copied this from Game.js. validates the game and currentUser
Canvas.propTypes = {
  game: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
}

// we don't use mapStateToProps here
// because we feed the needed props straight
// to the Canvas tag in the Game component
export default connect(null, { saveGame })(Canvas)
