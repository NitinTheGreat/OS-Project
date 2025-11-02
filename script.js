/**
 * OS Memory Simulator - Complete Application Logic
 * All-in-one consolidated implementation with proper event handling
 */

// ============================================
// Canvas Animation Engine
// ============================================
class AnimationEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext("2d")
    this.resizeCanvas()
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    this.canvas.width = Math.max(rect.width - 32, 300)
    this.canvas.height = 350
  }

  drawMemoryFrames(frames, frameCount, highlightIndex = -1, isHit = false, isFault = false) {
    // Clear canvas
    this.ctx.fillStyle = "rgba(10, 14, 39, 0.6)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const frameWidth = 70
    const frameHeight = 90
    const spacing = 20
    const totalWidth = frameCount * (frameWidth + spacing) - spacing
    const startX = (this.canvas.width - totalWidth) / 2
    const startY = 30

    const colors = {
      empty: "#4a6a9a",
      normal: "#00ff88",
      highlight: "#ff0055",
      hit: "#00ccff",
    }

    // Draw each frame
    frames.forEach((page, index) => {
      const x = startX + index * (frameWidth + spacing)
      const y = startY

      let color = colors.empty
      let borderColor = colors.empty

      if (page !== null) {
        if (index === highlightIndex) {
          color = isFault ? colors.highlight : isHit ? colors.hit : colors.normal
          borderColor = color
        } else {
          color = colors.normal
          borderColor = colors.normal
        }
      }

      // Draw frame background
      this.ctx.fillStyle = `rgba(${this.hexToRgb(color)}, 0.1)`
      this.ctx.strokeStyle = borderColor
      this.ctx.lineWidth = 2
      this.ctx.shadowColor = isFault && index === highlightIndex ? "rgba(255, 0, 85, 0.5)" : "transparent"
      this.ctx.shadowBlur = 10
      this.ctx.fillRect(x, y, frameWidth, frameHeight)
      this.ctx.strokeRect(x, y, frameWidth, frameHeight)
      this.ctx.shadowColor = "transparent"

      // Draw page number
      if (page !== null) {
        this.ctx.fillStyle = borderColor
        this.ctx.font = "bold 28px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(page, x + frameWidth / 2, y + frameHeight / 2 - 10)

        this.ctx.font = "11px monospace"
        this.ctx.fillStyle = "#4a6a9a"
        this.ctx.fillText(`Frm ${index}`, x + frameWidth / 2, y + frameHeight - 12)
      } else {
        this.ctx.fillStyle = "#4a6a9a"
        this.ctx.font = "italic 13px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText("EMPTY", x + frameWidth / 2, y + frameHeight / 2 - 10)
        this.ctx.font = "11px monospace"
        this.ctx.fillText(`Frm ${index}`, x + frameWidth / 2, y + frameHeight - 12)
      }
    })

    // Draw queue and stats
    this.drawQueue(frames, startX, startY + frameHeight + 50)
    this.drawStatisticsHUD(startX, startY + frameHeight + 120)
  }

  drawQueue(queue, startX, startY) {
    this.ctx.fillStyle = "#00ccff"
    this.ctx.font = "bold 12px monospace"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "top"
    this.ctx.fillText("QUEUE ORDER:", startX, startY)

    const itemWidth = 45
    const itemHeight = 32
    let currentX = startX

    queue.forEach((page) => {
      if (page !== null) {
        this.ctx.fillStyle = "rgba(0, 204, 255, 0.1)"
        this.ctx.strokeStyle = "#00ccff"
        this.ctx.lineWidth = 1
        this.ctx.fillRect(currentX, startY + 18, itemWidth, itemHeight)
        this.ctx.strokeRect(currentX, startY + 18, itemWidth, itemHeight)

        this.ctx.fillStyle = "#00ccff"
        this.ctx.font = "bold 14px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(page, currentX + itemWidth / 2, startY + 34)

        currentX += itemWidth + 12
      }
    })
  }

  drawStatisticsHUD(startX, startY) {
    this.ctx.fillStyle = "#00ff88"
    this.ctx.font = "bold 11px monospace"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "top"
    this.ctx.fillText("LEGEND:", startX, startY)

    const legend = [
      { color: "#00ff88", label: "Normal" },
      { color: "#ff0055", label: "Fault" },
      { color: "#00ccff", label: "Hit" },
    ]

    let currentX = startX
    legend.forEach((item) => {
      this.ctx.fillStyle = item.color
      this.ctx.fillRect(currentX, startY + 16, 12, 12)
      this.ctx.fillStyle = "#4a6a9a"
      this.ctx.font = "10px monospace"
      this.ctx.textAlign = "left"
      this.ctx.fillText(item.label, currentX + 16, startY + 16)
      currentX += 90
    })
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
      : "0, 255, 136"
  }
}

// ============================================
// Page Replacement Simulator
// ============================================
class PageReplacementSimulator {
  constructor(frames, referenceString) {
    this.frames = frames
    this.referenceString =
      typeof referenceString === "string"
        ? referenceString.split(",").map((x) => Number.parseInt(x.trim()))
        : Array.isArray(referenceString)
          ? referenceString
          : []
    this.initializeSimulation()
  }

  initializeSimulation() {
    this.memory = []
    this.pageFaults = 0
    this.pageHits = 0
    this.steps = []
  }

  simulateFIFO() {
    this.initializeSimulation()
    const queue = []

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        memoryBefore: [...queue],
        action: "",
        pageFault: false,
      }

      if (queue.includes(page)) {
        this.pageHits++
        stepInfo.action = `HIT: Page ${page} already in memory`
        stepInfo.pageFault = false
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (queue.length < this.frames) {
          stepInfo.action = `LOAD: Page ${page} loaded into frame ${queue.length}`
          queue.push(page)
        } else {
          const removed = queue.shift()
          stepInfo.action = `FAULT: Replaced page ${removed} with page ${page}`
          queue.push(page)
        }
      }

      stepInfo.memoryAfter = [...queue]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  simulateLRU() {
    this.initializeSimulation()
    const memory = []
    const accessTime = {}

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `HIT: Page ${page} marked as recently used`
        stepInfo.pageFault = false
        accessTime[page] = index
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `LOAD: Page ${page} loaded into frame ${memory.length}`
          memory.push(page)
          accessTime[page] = index
        } else {
          const lruPage = memory.reduce((min, p) => (accessTime[p] < accessTime[min] ? p : min))
          stepInfo.action = `FAULT: Replaced LRU page ${lruPage} with page ${page}`
          const idx = memory.indexOf(lruPage)
          memory.splice(idx, 1)
          memory.push(page)
          accessTime[page] = index
        }
      }

      stepInfo.memoryAfter = [...memory]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  simulateOptimal() {
    this.initializeSimulation()
    const memory = []

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `HIT: Page ${page} already in memory`
        stepInfo.pageFault = false
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `LOAD: Page ${page} loaded into frame ${memory.length}`
          memory.push(page)
        } else {
          const futureUse = memory.map((p) => {
            const nextUse = this.referenceString.slice(index + 1).indexOf(p)
            return nextUse === -1 ? Number.POSITIVE_INFINITY : nextUse
          })

          const pageToRemove = memory[futureUse.indexOf(Math.max(...futureUse))]
          stepInfo.action = `FAULT: Replaced page ${pageToRemove} (not used soon) with page ${page}`
          const idx = memory.indexOf(pageToRemove)
          memory.splice(idx, 1)
          memory.push(page)
        }
      }

      stepInfo.memoryAfter = [...memory]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  simulateClock() {
    this.initializeSimulation()
    const memory = []
    const referenceBit = {}
    let pointer = 0

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `HIT: Page ${page} ref bit = 1`
        stepInfo.pageFault = false
        referenceBit[page] = 1
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `LOAD: Page ${page} loaded into frame ${memory.length}`
          memory.push(page)
          referenceBit[page] = 1
        } else {
          while (referenceBit[memory[pointer]] === 1) {
            referenceBit[memory[pointer]] = 0
            pointer = (pointer + 1) % memory.length
          }

          const replaced = memory[pointer]
          stepInfo.action = `FAULT: Replaced page ${replaced} (ref=0) with page ${page}`
          memory[pointer] = page
          referenceBit[page] = 1
          pointer = (pointer + 1) % memory.length
        }
      }

      stepInfo.memoryAfter = [...memory]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  generateResults() {
    const totalReferences = this.referenceString.length
    const hitRate = totalReferences > 0 ? ((this.pageHits / totalReferences) * 100).toFixed(2) : 0
    const faultRate = totalReferences > 0 ? ((this.pageFaults / totalReferences) * 100).toFixed(2) : 0

    return {
      totalReferences,
      pageFaults: this.pageFaults,
      pageHits: this.pageHits,
      hitRate: Number.parseFloat(hitRate),
      faultRate: Number.parseFloat(faultRate),
    }
  }

  getStep(index) {
    return this.steps[index] || null
  }

  getTotalSteps() {
    return this.steps.length
  }
}

// ============================================
// Preset Scenarios
// ============================================
const PRESET_SCENARIOS = {
  scenario1: {
    name: "Light Load",
    frames: 3,
    referenceString: [1, 2, 3, 1, 2, 3],
  },
  scenario2: {
    name: "Normal Load",
    frames: 3,
    referenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
  },
  scenario3: {
    name: "Heavy Load",
    frames: 4,
    referenceString: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
  },
  scenario4: {
    name: "Worst Case",
    frames: 3,
    referenceString: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
  },
}

const ALGORITHM_DESCRIPTIONS = {
  FIFO: "First In First Out - The simplest page replacement algorithm. Pages are replaced in the order they were loaded into memory.",
  LRU: "Least Recently Used - Replaces page not used for longest time. Better performance than FIFO.",
  OPTIMAL: "Optimal - Replaces page not used for longest time in future. Theoretical best, impossible to implement.",
  CLOCK: "Clock Algorithm - Uses reference bits and clock pointer. Practical alternative to LRU.",
}

// ============================================
// Main Application Class
// ============================================
class OSMemorySimulator {
  constructor() {
    this.simulator = null
    this.animationEngine = null
    this.currentAlgorithm = "FIFO"
    this.currentMode = "preset"
    this.isPlaying = false
    this.currentStepIndex = 0
    this.speed = 1
    this.animationInterval = null

    this.initializeUI()
    this.setupEventListeners()
    this.loadPresetScenario("scenario2")
  }

  initializeUI() {
    this.animationEngine = new AnimationEngine("visualization-canvas")
    this.updateAlgorithmInfo()
  }

  setupEventListeners() {
    document.querySelectorAll(".algo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.selectAlgorithm(e))
    })

    // Mode selection
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.selectMode(e))
    })

    // Preset selection
    const presetSelect = document.getElementById("preset-select")
    if (presetSelect) {
      presetSelect.addEventListener("change", (e) => {
        if (e.target.value) {
          this.loadPresetScenario(e.target.value)
        }
      })
    }

    // Speed control
    const speedSlider = document.getElementById("speed-slider")
    if (speedSlider) {
      speedSlider.addEventListener("input", (e) => {
        this.speed = Number.parseFloat(e.target.value)
        document.getElementById("speed-value").textContent = this.speed.toFixed(1) + "x"
      })
    }

    // Playback controls
    document.getElementById("play-btn").addEventListener("click", () => this.togglePlayPause())
    document.getElementById("next-btn").addEventListener("click", () => this.nextStep())
    document.getElementById("prev-btn").addEventListener("click", () => this.previousStep())
    document.getElementById("reset-btn").addEventListener("click", () => this.resetSimulation())

    // Timeline
    const timelineSlider = document.getElementById("timeline-slider")
    if (timelineSlider) {
      timelineSlider.addEventListener("input", (e) => {
        const newIndex = Number.parseInt(e.target.value)
        this.currentStepIndex = newIndex
        this.isPlaying = false
        this.stopAnimation()
        this.updatePlayButton()
        this.updateVisualization()
        this.updateStatistics()
      })
    }

    // Export
    document.getElementById("screenshot-btn").addEventListener("click", () => this.takeScreenshot())
    document.getElementById("export-trace-btn").addEventListener("click", () => this.exportTrace())

    // Window resize
    window.addEventListener("resize", () => {
      this.animationEngine.resizeCanvas()
      this.updateVisualization()
    })
  }

  selectAlgorithm(event) {
    document.querySelectorAll(".algo-btn").forEach((btn) => btn.classList.remove("active"))
    event.target.classList.add("active")

    this.currentAlgorithm = event.target.dataset.algo
    this.updateAlgorithmInfo()
    this.runSimulation()
  }

  selectMode(event) {
    document.querySelectorAll(".mode-btn").forEach((btn) => btn.classList.remove("active"))
    event.target.classList.add("active")

    this.currentMode = event.target.dataset.mode

    const presetGroup = document.getElementById("preset-group")
    const customGroup = document.getElementById("custom-group")

    if (this.currentMode === "preset") {
      presetGroup.classList.remove("hidden")
      customGroup.classList.add("hidden")
      this.loadPresetScenario("scenario2")
    } else {
      presetGroup.classList.add("hidden")
      customGroup.classList.remove("hidden")
      this.runSimulationCustom()
    }
  }

  loadPresetScenario(scenarioId) {
    const scenario = PRESET_SCENARIOS[scenarioId]
    if (!scenario) return

    this.simulator = new PageReplacementSimulator(scenario.frames, scenario.referenceString)
    this.runSimulation()
  }

  runSimulationCustom() {
    const frames = Number.parseInt(document.getElementById("frame-count").value) || 3
    const refString = document.getElementById("ref-string").value

    if (!refString) {
      alert("Please enter a reference string")
      return
    }

    this.simulator = new PageReplacementSimulator(frames, refString)
    this.runSimulation()
  }

  runSimulation() {
    if (!this.simulator) {
      alert("Please load a scenario first")
      return
    }

    const method = `simulate${this.currentAlgorithm}`
    if (typeof this.simulator[method] === "function") {
      this.simulator[method]()
    }

    this.resetSimulation()
  }

  resetSimulation() {
    this.currentStepIndex = 0
    this.isPlaying = false
    this.stopAnimation()
    this.updatePlayButton()
    this.updateTimeline()
    this.updateVisualization()
    this.updateStatistics()
    this.updateFramesDisplay()
    this.updateQueueDisplay()
    document.getElementById("status").textContent = "Ready"
  }

  togglePlayPause() {
    if (!this.simulator || this.simulator.getTotalSteps() === 0) {
      alert("Please load a scenario first")
      return
    }

    this.isPlaying = !this.isPlaying
    this.updatePlayButton()

    if (this.isPlaying) {
      document.getElementById("status").textContent = "Playing"
      this.startAnimation()
    } else {
      document.getElementById("status").textContent = "Paused"
      this.stopAnimation()
    }
  }

  startAnimation() {
    const stepDuration = 1000 / this.speed

    const animate = () => {
      if (this.isPlaying && this.currentStepIndex < this.simulator.getTotalSteps()) {
        this.updateVisualization()
        this.updateStatistics()
        this.updateFramesDisplay()
        this.updateQueueDisplay()

        this.currentStepIndex++
        this.updateTimeline()

        if (this.currentStepIndex < this.simulator.getTotalSteps()) {
          this.animationInterval = setTimeout(animate, stepDuration)
        } else {
          this.isPlaying = false
          this.stopAnimation()
          this.updatePlayButton()
          document.getElementById("status").textContent = "Completed"
        }
      }
    }

    animate()
  }

  stopAnimation() {
    if (this.animationInterval) {
      clearTimeout(this.animationInterval)
      this.animationInterval = null
    }
  }

  nextStep() {
    if (!this.simulator) return
    if (this.currentStepIndex < this.simulator.getTotalSteps() - 1) {
      this.isPlaying = false
      this.updatePlayButton()
      this.currentStepIndex++
      this.updateTimeline()
      this.updateVisualization()
      this.updateStatistics()
      this.updateFramesDisplay()
      this.updateQueueDisplay()
    }
  }

  previousStep() {
    if (!this.simulator) return
    if (this.currentStepIndex > 0) {
      this.isPlaying = false
      this.updatePlayButton()
      this.currentStepIndex--
      this.updateTimeline()
      this.updateVisualization()
      this.updateStatistics()
      this.updateFramesDisplay()
      this.updateQueueDisplay()
    }
  }

  updatePlayButton() {
    const playBtn = document.getElementById("play-btn")
    playBtn.classList.toggle("active", this.isPlaying)
    playBtn.querySelector(".btn-icon").textContent = this.isPlaying ? "⏸" : "▶"
  }

  updateTimeline() {
    if (!this.simulator) return

    const totalSteps = this.simulator.getTotalSteps()
    const slider = document.getElementById("timeline-slider")
    slider.max = Math.max(totalSteps - 1, 0)
    slider.value = this.currentStepIndex
    document.getElementById("timeline-info").textContent = `Step: ${this.currentStepIndex + 1} / ${totalSteps}`
  }

  updateVisualization() {
    if (!this.simulator || this.simulator.getTotalSteps() === 0) return

    const step = this.simulator.getStep(this.currentStepIndex)
    if (!step) return

    const memoryFrames = [...step.memoryAfter]
    while (memoryFrames.length < this.simulator.frames) {
      memoryFrames.push(null)
    }

    const highlightIndex = memoryFrames.indexOf(step.page)
    this.animationEngine.drawMemoryFrames(
      memoryFrames,
      this.simulator.frames,
      highlightIndex,
      !step.pageFault,
      step.pageFault,
    )
  }

  updateStatistics() {
    if (!this.simulator) {
      document.getElementById("stat-faults").textContent = "0"
      document.getElementById("stat-hit-rate").textContent = "0%"
      document.getElementById("stat-utilization").textContent = "0%"
      document.getElementById("stat-total").textContent = "0"
      return
    }

    let faultsSoFar = 0
    let hitsSoFar = 0

    for (let i = 0; i <= this.currentStepIndex; i++) {
      const s = this.simulator.getStep(i)
      if (!s) continue
      if (s.pageFault) {
        faultsSoFar++
      } else {
        hitsSoFar++
      }
    }

    const totalSoFar = Math.min(this.currentStepIndex + 1, this.simulator.getTotalSteps())
    const step = this.simulator.getStep(this.currentStepIndex)
    const hitRate = totalSoFar > 0 ? ((hitsSoFar / totalSoFar) * 100).toFixed(1) : 0
    const utilization = step && step.memoryAfter.length > 0
      ? ((step.memoryAfter.length / this.simulator.frames) * 100).toFixed(0)
      : 0

    document.getElementById("stat-faults").textContent = faultsSoFar
    document.getElementById("stat-hit-rate").textContent = hitRate + "%"
    document.getElementById("stat-utilization").textContent = utilization + "%"
    document.getElementById("stat-total").textContent = totalSoFar
  }

  updateFramesDisplay() {
    if (!this.simulator) {
      document.getElementById("frames-display").innerHTML = ""
      return
    }

    const step = this.simulator.getStep(this.currentStepIndex)
    if (!step) {
      document.getElementById("frames-display").innerHTML = ""
      return
    }

    const padded = [...step.memoryAfter]
    while (padded.length < this.simulator.frames) padded.push(null)

    const html = padded
      .map((page) => (page !== null ? `<span class="frame-badge">${page}</span>` : `<span class="frame-badge empty">-</span>`))
      .join("")

    document.getElementById("frames-display").innerHTML = html
  }

  updateQueueDisplay() {
    if (!this.simulator) {
      document.getElementById("queue-display").innerHTML = ""
      document.getElementById("info-text").textContent = "Select an algorithm and click play to start simulation"
      return
    }

    const step = this.simulator.getStep(this.currentStepIndex)
    if (!step) {
      document.getElementById("queue-display").innerHTML = ""
      document.getElementById("info-text").textContent = "Select an algorithm and click play to start simulation"
      return
    }

    document.getElementById("info-text").textContent = step.action

    const queueHtml = step.memoryAfter
      .map((page) => (page !== null ? `<span class=\"queue-badge\">${page}</span>` : ""))
      .join("")

    document.getElementById("queue-display").innerHTML = queueHtml
  }

  updateAlgorithmInfo() {
    document.getElementById("algo-title").textContent = this.currentAlgorithm
    document.getElementById("algo-description").textContent =
      ALGORITHM_DESCRIPTIONS[this.currentAlgorithm] || "Algorithm information not available"
  }

  takeScreenshot() {
    const canvas = document.getElementById("visualization-canvas")
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `os-simulator-${this.currentAlgorithm}-${Date.now()}.png`
    link.click()
  }

  exportTrace() {
    if (!this.simulator || this.simulator.getTotalSteps() === 0) {
      alert("No simulation data to export")
      return
    }

    let traceData = `OS MEMORY SIMULATOR - EXECUTION TRACE\n`
    traceData += `=====================================\n`
    traceData += `Algorithm: ${this.currentAlgorithm}\n`
    traceData += `Frames: ${this.simulator.frames}\n`
    traceData += `Reference String: ${this.simulator.referenceString.join(", ")}\n`
    traceData += `Total References: ${this.simulator.referenceString.length}\n`
    traceData += `\n`

    traceData += `DETAILED TRACE:\n`
    traceData += `=====================================\n\n`

    this.simulator.steps.forEach((step) => {
      traceData += `Step ${step.step}: Page Reference = ${step.page}\n`
      traceData += `  Memory Before: [${step.memoryBefore.join(", ") || "empty"}]\n`
      traceData += `  Memory After:  [${step.memoryAfter.join(", ") || "empty"}]\n`
      traceData += `  Action: ${step.action}\n`
      traceData += `  Fault: ${step.pageFault ? "YES" : "NO"}\n\n`
    })

    traceData += `SUMMARY STATISTICS:\n`
    traceData += `=====================================\n`
    traceData += `Total Page Faults: ${this.simulator.pageFaults}\n`
    traceData += `Total Page Hits: ${this.simulator.pageHits}\n`
    traceData += `Hit Rate: ${((this.simulator.pageHits / this.simulator.referenceString.length) * 100).toFixed(2)}%\n`
    traceData += `Fault Rate: ${((this.simulator.pageFaults / this.simulator.referenceString.length) * 100).toFixed(2)}%\n`

    const blob = new Blob([traceData], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `os-simulator-trace-${this.currentAlgorithm}-${Date.now()}.txt`
    link.click()
  }
}

// ============================================
// Initialize Application on DOM Load
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const app = new OSMemorySimulator()
})
