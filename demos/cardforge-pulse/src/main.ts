import './style.css'
import { COPY } from './copy/zh-HK'
import { CARD_DEFS, formatCardDesc } from './data/cards'
import { ENEMIES, intentKindLabel } from './data/enemies'
import {
  endTurnOnRun,
  enterCurrentNode,
  newRun,
  pickReward,
  playCardOnRun,
  restWithHeal,
  restLeave,
  runDurationSec,
  startRun,
  summaryLines,
  transitionLine,
  type RunStateExt,
} from './game/run'
import { canPlayCard, livingEnemies } from './combat/engine'
import {
  enemySprite,
  enemySpriteNeedsEliteTint,
  frameForCard,
  intentIcon,
  PALETTE,
} from './assets/mm-slice-v1'

let state: RunStateExt = newRun() as RunStateExt
const root = document.getElementById('app')!

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text != null) node.textContent = text
  return node
}

function render() {
  root.innerHTML = ''
  document.documentElement.style.setProperty('--deep-bg', PALETTE.deep_bg)
  const shell = el('div', 'shell')
  root.appendChild(shell)

  if (state.screen === 'title') renderTitle(shell)
  else if (state.screen === 'map') renderMap(shell)
  else if (state.screen === 'combat') renderCombat(shell)
  else if (state.screen === 'reward') renderReward(shell)
  else if (state.screen === 'rest') renderRest(shell)
  else if (state.screen === 'summary') renderSummary(shell)
}

function renderTitle(shell: HTMLElement) {
  const box = el('div', 'title-screen panel')
  const h1 = el('h1', '', COPY.title)
  const sub = el('div', 'sub', COPY.subtitle)
  const story = el('p', 'story', COPY.openLine)
  const how = el('p', 'story', COPY.howTo)
  const btn = el('button', 'btn', COPY.menu.newRun) as HTMLButtonElement
  btn.type = 'button'
  btn.onclick = () => {
    state = startRun(state)
    render()
  }
  const howBtn = el('button', 'btn secondary', COPY.menu.howToPlay) as HTMLButtonElement
  howBtn.type = 'button'
  howBtn.style.marginTop = '10px'
  howBtn.onclick = () => alert(COPY.howTo)
  box.append(h1, sub, story, how, btn, howBtn)
  shell.appendChild(box)
}

function renderMap(shell: HTMLElement) {
  const box = el('div', 'map-screen')
  box.appendChild(el('h2', '', `${COPY.map.header} · ${COPY.map.pickNext}`))
  const list = el('div', 'node-list')
  state.mapNodes.forEach((node, i) => {
    const row = el('div', `node${i === state.mapIndex ? ' current' : ''}${node.cleared ? ' cleared' : ''}`)
    const left = el('div')
    left.appendChild(el('div', 'scene', node.sceneZh))
    left.appendChild(el('div', 'kind', node.labelZh))
    row.appendChild(left)
    if (i === state.mapIndex && !node.cleared) {
      const go = el('button', 'btn', '進入') as HTMLButtonElement
      go.type = 'button'
      go.onclick = () => {
        state = enterCurrentNode(state)
        render()
      }
      row.appendChild(go)
    } else if (node.cleared) {
      row.appendChild(el('span', '', '✓'))
    } else {
      row.appendChild(el('span', '', COPY.map.locked))
    }
    list.appendChild(row)
  })
  box.appendChild(list)
  const hud = el('div', 'hud panel')
  hud.style.marginTop = '12px'
  hud.textContent = `${COPY.hud.playerHp} ${state.hp}/${state.maxHp} · ${COPY.summary.seed} ${state.seedLabel}`
  box.appendChild(hud)
  shell.appendChild(box)
}

function renderCombat(shell: HTMLElement) {
  const c = state.combat
  if (!c) return

  const wrap = el('div', 'combat-screen')
  const hud = el('div', 'hud')
  hud.innerHTML = `
    <div>${COPY.hud.playerHp} <span>${c.player.hp}</span>/${c.player.maxHp}</div>
    <div>${COPY.hud.block} <span>${c.player.block}</span></div>
    <div>${COPY.hud.energy} <span>${c.player.energy}</span>/${c.player.maxEnergy}</div>
    <div>${COPY.hud.drawPile} ${c.drawPile.length} · ${COPY.hud.discard} ${c.discard.length}</div>
  `
  wrap.appendChild(hud)

  const enemiesRow = el('div', 'enemies')
  for (const e of c.enemies) {
    if (!e.alive) continue
    const def = ENEMIES[e.defId]
    const card = el('div', 'enemy')
    const img = document.createElement('img')
    const src = enemySprite(e.defId)
    if (src) {
      img.src = src
      img.alt = def.nameZh
      if (enemySpriteNeedsEliteTint(e.defId)) img.classList.add('elite-tint')
      img.onerror = () => {
        img.style.display = 'none'
      }
    }
    card.appendChild(img)
    card.appendChild(el('div', 'name', def.nameZh))
    card.appendChild(el('div', 'hp', `${COPY.hud.enemyHp} ${e.hp}/${e.maxHp}`))
    const intent = el('div', 'intent')
    const ic = document.createElement('img')
    ic.src = intentIcon(e.intent.kind)
    ic.alt = intentKindLabel(e.intent.kind)
    intent.append(ic, el('span', '', `${COPY.hud.intent}${intentKindLabel(e.intent.kind)} ${e.intent.labelZh}`))
    card.appendChild(intent)
    enemiesRow.appendChild(card)
  }
  wrap.appendChild(enemiesRow)

  const hand = el('div', 'hand')
  c.hand.forEach((card, idx) => {
    const def = CARD_DEFS[card.defId]
    const btn = el('button', 'card') as HTMLButtonElement
    btn.type = 'button'
    btn.disabled = !canPlayCard(c, idx)
    const frame = document.createElement('img')
    frame.className = 'frame'
    frame.src = frameForCard(def)
    frame.alt = ''
    const inner = el('div', 'inner')
    inner.appendChild(el('div', 'cost', String(def.cost)))
    inner.appendChild(el('div', 'title', def.nameZh))
    inner.appendChild(el('div', 'desc', formatCardDesc(def.descZh)))
    btn.append(frame, inner)
    btn.onclick = () => {
      const targets = livingEnemies(c)
      const target = targets.length === 1 ? targets[0].uid : targets[0]?.uid ?? null
      state = playCardOnRun(state, idx, target)
      render()
    }
    hand.appendChild(btn)
  })
  wrap.appendChild(hand)

  const actions = el('div', 'combat-actions')
  const endBtn = el('button', 'btn secondary', COPY.hud.endTurn) as HTMLButtonElement
  endBtn.type = 'button'
  endBtn.disabled = c.combatWon || c.combatLost
  endBtn.onclick = () => {
    if (!confirm(COPY.hud.endTurnConfirm)) return
    state = endTurnOnRun(state)
    render()
  }
  actions.appendChild(endBtn)
  wrap.appendChild(actions)

  const log = el('div', 'log')
  log.textContent = c.log.slice(-6).join(' · ')
  wrap.appendChild(log)
  shell.appendChild(wrap)
}

function renderReward(shell: HTMLElement) {
  const box = el('div', 'title-screen panel')
  box.appendChild(el('h1', '', COPY.combat.victory))
  box.appendChild(el('p', 'story', COPY.combat.pickReward))
  const row = el('div', 'hand')
  row.style.justifyContent = 'center'
  for (const id of state.rewardChoices ?? []) {
    const def = CARD_DEFS[id]
    const btn = el('button', 'card') as HTMLButtonElement
    btn.type = 'button'
    const frame = document.createElement('img')
    frame.className = 'frame'
    frame.src = frameForCard(def)
    const inner = el('div', 'inner')
    inner.appendChild(el('div', 'cost', String(def.cost)))
    inner.appendChild(el('div', 'title', def.nameZh))
    inner.appendChild(el('div', 'desc', formatCardDesc(def.descZh)))
    btn.append(frame, inner)
    btn.onclick = () => {
      state = pickReward(state, id)
      render()
    }
    row.appendChild(btn)
  }
  box.appendChild(row)
  const skip = el('button', 'btn secondary', COPY.combat.skipReward) as HTMLButtonElement
  skip.type = 'button'
  skip.style.marginTop = '12px'
  skip.onclick = () => {
    state = pickReward(state, null)
    render()
  }
  box.appendChild(skip)
  shell.appendChild(box)
}

function renderRest(shell: HTMLElement) {
  const box = el('div', 'title-screen panel')
  box.appendChild(el('h1', '', COPY.rest.title))
  box.appendChild(el('p', 'story', `「${state.hp < 25 ? COPY.rest.lowHp : COPY.rest.enter}」`))
  box.appendChild(el('p', 'story', `${COPY.furnaceAuntie}：${COPY.rest.heal} +${COPY.rest.healAmount}`))
  const heal = el('button', 'btn', COPY.rest.heal) as HTMLButtonElement
  heal.type = 'button'
  heal.onclick = () => {
    state = restWithHeal(state)
    render()
  }
  const cont = el('button', 'btn secondary', COPY.rest.leave) as HTMLButtonElement
  cont.type = 'button'
  cont.style.marginTop = '10px'
  cont.onclick = () => {
    state = restLeave(state)
    render()
  }
  box.append(heal, cont)
  shell.appendChild(box)
}

function renderSummary(shell: HTMLElement) {
  const { title, body, subtitle } = summaryLines(state)
  const box = el('div', 'title-screen panel')
  box.appendChild(el('h1', '', title))
  box.appendChild(el('p', 'story', subtitle))
  box.appendChild(el('p', 'story', body))
  const stats = el('p', 'story')
  stats.textContent = `${COPY.summary.thisRun} · ${COPY.summary.nodeReached} ${Math.min(state.mapIndex + 1, state.mapNodes.length)} ${COPY.summary.nodeSuffix} · ${COPY.summary.foesBroken} ${state.fightsWon} · ${summaryLines(state).title === COPY.death.title ? '' : ''}${COPY.summary.seed} ${state.seedLabel} · 用時 ${runDurationSec(state)}s`
  box.appendChild(stats)
  box.appendChild(el('p', 'story', transitionLine(state)))
  if (state.runLost) box.appendChild(el('p', 'story', COPY.death.tip))
  const again = el('button', 'btn', `${COPY.summary.newRun}（${COPY.summary.newRunFlavor}）`) as HTMLButtonElement
  again.type = 'button'
  again.onclick = () => {
    if (!confirm(COPY.summary.confirmNew)) return
    state = startRun(newRun() as RunStateExt)
    render()
  }
  box.appendChild(again)
  shell.appendChild(box)
}

function mountCatalogBack() {
  const HREF = 'https://vincentsckan.github.io/vincent-games-studio/games/cardforge-pulse/'
  const LABEL = COPY.menu.backCatalog
  let rootBack = document.getElementById('vg-back-root')
  if (!rootBack) {
    rootBack = document.createElement('div')
    rootBack.id = 'vg-back-root'
    document.body.appendChild(rootBack)
  }
  let a = document.getElementById('vg-back-tr') as HTMLAnchorElement | null
  if (!a) {
    a = document.createElement('a')
    a.id = 'vg-back-tr'
    a.className = 'vg-back-btn'
    rootBack.appendChild(a)
  }
  a.href = HREF
  a.title = LABEL
  a.textContent = LABEL
}

render()
mountCatalogBack()
