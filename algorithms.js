/**
 * Page Replacement Algorithms
 * Implementation of FIFO, LRU, Optimal, and Clock algorithms
 */

class PageReplacementSimulator {
  constructor(frames, referenceString) {
    this.frames = frames
    this.referenceString =
      typeof referenceString === "string"
        ? referenceString.split(",").map((x) => Number.parseInt(x.trim()))
        : referenceString
    this.initializeSimulation()
  }

  initializeSimulation() {
    this.memory = []
    this.pageFaults = 0
    this.pageHits = 0
    this.steps = []
    this.currentStep = 0
    this.executionTrace = []
  }

  // ============================================
  // FIFO Algorithm
  // ============================================
  simulateFIFO() {
    this.initializeSimulation()
    const queue = []

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        algorithm: "FIFO",
        memoryBefore: [...queue],
        action: "",
        pageFault: false,
      }

      if (queue.includes(page)) {
        this.pageHits++
        stepInfo.action = `Hit: Page ${page} already in memory`
        stepInfo.pageFault = false
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (queue.length < this.frames) {
          stepInfo.action = `Load: Page ${page} loaded into empty frame`
          queue.push(page)
        } else {
          const removed = queue.shift()
          stepInfo.action = `Fault: Replace page ${removed} with page ${page}`
          queue.push(page)
        }
      }

      stepInfo.memoryAfter = [...queue]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  // ============================================
  // LRU Algorithm
  // ============================================
  simulateLRU() {
    this.initializeSimulation()
    const memory = []
    const accessTime = {}

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        algorithm: "LRU",
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `Hit: Page ${page} marked as recently used`
        stepInfo.pageFault = false
        accessTime[page] = index
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `Load: Page ${page} loaded into empty frame`
          memory.push(page)
          accessTime[page] = index
        } else {
          const lruPage = memory.reduce((min, p) => (accessTime[p] < accessTime[min] ? p : min))
          stepInfo.action = `Fault: Replace LRU page ${lruPage} with page ${page}`
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

  // ============================================
  // Optimal Algorithm
  // ============================================
  simulateOptimal() {
    this.initializeSimulation()
    const memory = []

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        algorithm: "Optimal",
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `Hit: Page ${page} already in memory`
        stepInfo.pageFault = false
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `Load: Page ${page} loaded into empty frame`
          memory.push(page)
        } else {
          const futureUse = memory.map((p) => {
            const nextUse = this.referenceString.slice(index + 1).indexOf(p)
            return nextUse === -1 ? Number.POSITIVE_INFINITY : nextUse
          })

          const pageToRemove = memory[futureUse.indexOf(Math.max(...futureUse))]
          stepInfo.action = `Fault: Replace page ${pageToRemove} with page ${page}`
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

  // ============================================
  // Clock Algorithm
  // ============================================
  simulateClock() {
    this.initializeSimulation()
    const memory = []
    const referencebit = {}
    let pointer = 0

    this.referenceString.forEach((page, index) => {
      const stepInfo = {
        step: index + 1,
        page: page,
        algorithm: "Clock",
        memoryBefore: [...memory],
        action: "",
        pageFault: false,
      }

      if (memory.includes(page)) {
        this.pageHits++
        stepInfo.action = `Hit: Page ${page} reference bit set to 1`
        stepInfo.pageFault = false
        referencebit[page] = 1
      } else {
        this.pageFaults++
        stepInfo.pageFault = true

        if (memory.length < this.frames) {
          stepInfo.action = `Load: Page ${page} loaded into empty frame`
          memory.push(page)
          referencebit[page] = 1
        } else {
          while (referencebit[memory[pointer]] === 1) {
            referencebit[memory[pointer]] = 0
            pointer = (pointer + 1) % memory.length
          }

          const replaced = memory[pointer]
          stepInfo.action = `Fault: Replace page ${replaced} (ref bit=0) with page ${page}`
          memory[pointer] = page
          referencebit[page] = 1
          pointer = (pointer + 1) % memory.length
        }
      }

      stepInfo.memoryAfter = [...memory]
      this.steps.push(stepInfo)
    })

    return this.generateResults()
  }

  // ============================================
  // Results Generation
  // ============================================
  generateResults() {
    const totalReferences = this.referenceString.length
    const hitRate = ((this.pageHits / totalReferences) * 100).toFixed(2)
    const faultRate = ((this.pageFaults / totalReferences) * 100).toFixed(2)

    return {
      totalReferences,
      pageFaults: this.pageFaults,
      pageHits: this.pageHits,
      hitRate: Number.parseFloat(hitRate),
      faultRate: Number.parseFloat(faultRate),
      steps: this.steps,
      frameUtilization: ((this.memory.length / this.frames) * 100).toFixed(0),
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
    description: "Simple repeating pattern with no page faults after initial load",
  },
  scenario2: {
    name: "Normal Load",
    frames: 3,
    referenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
    description: "Standard workload with mixed references",
  },
  scenario3: {
    name: "Heavy Load",
    frames: 4,
    referenceString: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
    description: "High contention with working set larger than memory",
  },
  scenario4: {
    name: "Worst Case (Thrashing)",
    frames: 3,
    referenceString: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
    description: "Thrashing scenario where working set exceeds memory capacity",
  },
}

// Algorithm descriptions
const ALGORITHM_DESCRIPTIONS = {
  FIFO: "First In First Out - The simplest page replacement algorithm. Pages are replaced in the order they were loaded into memory. Suffers from Belady's anomaly.",
  LRU: "Least Recently Used - Replaces the page that has not been used for the longest time. Provides better performance than FIFO but requires tracking access times.",
  OPTIMAL:
    "Optimal Page Replacement - Replaces the page that will not be used for the longest time in the future. Theoretical best but impossible to implement (requires future knowledge).",
  CLOCK:
    "Clock Algorithm - Similar to LRU but uses reference bits and a clock pointer for efficient implementation. Practical alternative to full LRU tracking.",
}
