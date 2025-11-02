/**
 * Canvas Animation and Visualization Engine
 * Handles smooth animations and visual rendering
 */

class AnimationEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext("2d")
    this.resizeCanvas()
    this.animationFrameId = null
    this.frameNumber = 0
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    this.canvas.width = rect.width - 32 // Subtract padding
    this.canvas.height = 300
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
  }

  // ============================================
  // Memory Frame Visualization
  // ============================================
  drawMemoryFrames(frames, frameCount, highlightIndex = -1, isHit = false, isFault = false) {
    this.ctx.fillStyle = "rgba(10, 14, 39, 0.6)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const frameWidth = 60
    const frameHeight = 80
    const spacing = 20
    const totalWidth = frameCount * (frameWidth + spacing) - spacing
    const startX = (this.canvas.width - totalWidth) / 2
    const startY = 50

    const colors = {
      empty: "#4a6a9a",
      normal: "#00ff88",
      highlight: "#ff0055",
      hit: "#00ccff",
    }

    // Draw frames
    frames.forEach((page, index) => {
      const x = startX + index * (frameWidth + spacing)
      const y = startY

      // Determine color
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
        this.ctx.font = "bold 24px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(page, x + frameWidth / 2, y + frameHeight / 2 - 10)

        // Draw label
        this.ctx.font = "12px monospace"
        this.ctx.fillStyle = "#4a6a9a"
        this.ctx.fillText(`Frame ${index}`, x + frameWidth / 2, y + frameHeight - 15)
      } else {
        this.ctx.fillStyle = "#4a6a9a"
        this.ctx.font = "italic 14px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText("Empty", x + frameWidth / 2, y + frameHeight / 2 - 10)
        this.ctx.font = "12px monospace"
        this.ctx.fillText(`Frame ${index}`, x + frameWidth / 2, y + frameHeight - 15)
      }
    })

    // Draw queue visualization
    this.drawQueue(frames, startX, startY + frameHeight + 60)

    // Draw statistics at bottom
    this.drawStatisticsHUD(startX, startY + frameHeight + 140)
  }

  drawQueue(queue, startX, startY) {
    this.ctx.fillStyle = "#00ccff"
    this.ctx.font = "bold 12px monospace"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "top"
    this.ctx.fillText("Queue Order:", startX, startY)

    const itemWidth = 40
    const itemHeight = 30
    let currentX = startX

    queue.forEach((page, index) => {
      if (page !== null) {
        this.ctx.fillStyle = "rgba(0, 204, 255, 0.1)"
        this.ctx.strokeStyle = "#00ccff"
        this.ctx.lineWidth = 1
        this.ctx.fillRect(currentX, startY + 20, itemWidth, itemHeight)
        this.ctx.strokeRect(currentX, startY + 20, itemWidth, itemHeight)

        this.ctx.fillStyle = "#00ccff"
        this.ctx.font = "bold 14px monospace"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(page, currentX + itemWidth / 2, startY + 35)

        currentX += itemWidth + 10
      }
    })
  }

  drawStatisticsHUD(startX, startY) {
    this.ctx.fillStyle = "#00ff88"
    this.ctx.font = "bold 11px monospace"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "top"
    this.ctx.fillText("Legend:", startX, startY)

    const legend = [
      { color: "#00ff88", label: "Normal" },
      { color: "#ff0055", label: "Fault" },
      { color: "#00ccff", label: "Hit" },
    ]

    let currentX = startX
    legend.forEach((item) => {
      this.ctx.fillStyle = item.color
      this.ctx.fillRect(currentX, startY + 18, 12, 12)
      this.ctx.fillStyle = "#4a6a9a"
      this.ctx.font = "10px monospace"
      this.ctx.textAlign = "left"
      this.ctx.fillText(item.label, currentX + 16, startY + 18)
      currentX += 80
    })
  }

  // ============================================
  // Utility Functions
  // ============================================
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
      : "0, 255, 136"
  }

  clear() {
    this.ctx.fillStyle = "rgba(10, 14, 39, 0.6)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawText(text, x, y, fontSize = 14, color = "#00ff88", align = "left") {
    this.ctx.fillStyle = color
    this.ctx.font = `${fontSize}px monospace`
    this.ctx.textAlign = align
    this.ctx.textBaseline = "top"
    this.ctx.fillText(text, x, y)
  }
}

// This file is kept empty for backward compatibility
