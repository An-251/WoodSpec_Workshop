import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const woodLine = "#6b3f20"
const floorColor = "#f0e8dd"
const canReferenceUrl = "/models/coca-reference.glb"
const cokeCanHeight = 0.115
const cokeCanDiameter = 0.066
const partLabels = {
  overall: "Tổng thể",
  carcass: "Thân tủ",
  desktop: "Mặt bàn",
  legs: "Chân bàn",
  deskStorage: "Hộc bàn",
  shelf: "Kệ và khoang",
  divider: "Vách chia",
  door: "Cánh tủ",
  drawer: "Ngăn kéo",
  handle: "Tay nắm",
  back: "Hậu tủ",
  base: "Chân/đế",
  cable: "Lỗ luồn dây",
  seat: "Đệm ngồi",
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatCmFromMm(value) {
  const cm = value / 10
  return Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace(/\.0$/, "")
}

function normalizeColor(hex) {
  if (typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex)) {
    return hex
  }

  return "#c99d5a"
}

function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.62,
    metalness: options.metalness ?? 0.04,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  })
}

function getPartIdFromName(name = "") {
  if (["left-side", "right-side", "top", "bottom"].includes(name)) {
    return "carcass"
  }
  if (name === "desk-top") return "desktop"
  if (name === "desk-leg") return "legs"
  if (name === "desk-pedestal") return "deskStorage"
  if (name === "shelf") return "shelf"
  if (name === "vertical-divider") return "divider"
  if (name === "door") return "door"
  if (name === "drawer" || name === "drawer-front") return "drawer"
  if (name === "handle" || name === "vent-slot") return "handle"
  if (name === "back-panel") return "back"
  if (name === "toe-kick") return "base"
  if (name === "seat-pad") return "seat"
  if (name === "cable-hole") return "cable"
  return "overall"
}

function addBox(group, size, position, material, name = "panel") {
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
  const mesh = new THREE.Mesh(geometry, material.clone())
  mesh.position.set(position.x, position.y, position.z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = name
  mesh.userData.partId = getPartIdFromName(name)
  group.add(mesh)

  return mesh
}

function addHandle(group, position, size, style, material) {
  if (style === "none") {
    return
  }

  if (style === "round-knob") {
    const geometry = new THREE.SphereGeometry(size.x, 20, 14)
    const mesh = new THREE.Mesh(geometry, material.clone())
    mesh.position.set(position.x, position.y, position.z)
    mesh.castShadow = true
    mesh.name = "handle"
    mesh.userData.partId = "handle"
    group.add(mesh)
    return
  }

  const isVertical = style === "vertical-bar"
  addBox(
    group,
    {
      x: isVertical ? size.x : size.y,
      y: isVertical ? size.y : size.x,
      z: size.z,
    },
    position,
    material,
    "handle",
  )
}

function addWoodGrain(group, width, height, depth, lineMaterial) {
  const grainCount = 14
  const z = depth / 2 + 0.006

  Array.from({ length: grainCount }).forEach((_, index) => {
    const y = 0.2 + (height - 0.4) * (index / (grainCount - 1))
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width / 2 + 0.08, y, z),
      new THREE.Vector3(-width / 6, y + (index % 2 ? 0.025 : -0.025), z),
      new THREE.Vector3(width / 6, y + (index % 3 ? -0.015 : 0.03), z),
      new THREE.Vector3(width / 2 - 0.08, y, z),
    ])
    const points = curve.getPoints(24)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, lineMaterial)
    group.add(line)
  })
}

function addVentSlots(group, x, y, z, width, material) {
  Array.from({ length: 4 }).forEach((_, index) => {
    addBox(
      group,
      { x: width, y: 0.012, z: 0.012 },
      { x, y: y + index * 0.055, z },
      material,
      "vent-slot",
    )
  })
}

function createTextSprite(text) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 192
  const context = canvas.getContext("2d")
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "rgba(255, 250, 246, 0.94)"
  context.strokeStyle = "#d7c3b5"
  context.lineWidth = 8
  context.roundRect(16, 28, 480, 128, 34)
  context.fill()
  context.stroke()
  context.fillStyle = "#854f19"
  context.font = "700 58px Arial"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(text, 256, 94)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.5, 0.19, 1)
  return sprite
}

function addCanReferenceLabel(group) {
  const canLabel = createTextSprite("11,5 cm")
  canLabel.position.set(0.16, 0.2, 0)
  canLabel.scale.set(0.54, 0.2, 1)
  group.add(canLabel)
}

function normalizeLoadedCan(model) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  model.scale.set(
    size.x > 0 ? cokeCanDiameter / size.x : 1,
    size.y > 0 ? cokeCanHeight / size.y : 1,
    size.z > 0 ? cokeCanDiameter / size.z : 1,
  )

  const scaledBox = new THREE.Box3().setFromObject(model)
  const center = scaledBox.getCenter(new THREE.Vector3())
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= scaledBox.min.y
}

function createFallbackCan() {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(cokeCanDiameter / 2, cokeCanDiameter / 2, cokeCanHeight, 32),
    createMaterial("#b51f24", { roughness: 0.44, metalness: 0.18 }),
  )
  body.position.y = cokeCanHeight / 2
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const topMaterial = createMaterial("#d8d1c8", { roughness: 0.32, metalness: 0.35 })
  ;[0, cokeCanHeight].forEach((y) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(cokeCanDiameter / 2, cokeCanDiameter / 2, 0.006, 32), topMaterial)
    cap.position.y = y
    cap.castShadow = true
    group.add(cap)
  })

  return group
}

function addCanScaleReference(scene, bounds) {
  const group = new THREE.Group()
  const x = -bounds.width / 2 - 0.28
  const z = bounds.depth / 2 + 0.18

  group.position.set(x, 0, z)
  group.name = "coca-scale-reference"
  addCanReferenceLabel(group)
  scene.add(group)

  const loader = new GLTFLoader()
  loader.load(
    canReferenceUrl,
    (gltf) => {
      const baseCan = gltf.scene
      baseCan.name = "coca-reference-model"
      baseCan.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          child.frustumCulled = false
        }
      })
      normalizeLoadedCan(baseCan)
      baseCan.rotation.y = -0.2
      group.add(baseCan)
    },
    undefined,
    () => {
      group.add(createFallbackCan())
    },
  )

  return group
}

function buildProductModel(configuration) {
  const { dimensions, color, layout, designDetails = {}, product } = configuration
  const group = new THREE.Group()
  const bodyColor = normalizeColor(color?.hex)
  const darkerColor = new THREE.Color(bodyColor).offsetHSL(0, -0.05, -0.18).getStyle()
  const lightColor = new THREE.Color(bodyColor).offsetHSL(0.02, -0.12, 0.2).getStyle()
  const width = clamp(dimensions.width / 1000, 0.7, 3.2)
  const height = clamp(dimensions.height / 1000, 0.55, 2.7)
  const depth = clamp(dimensions.depth / 1000, 0.28, 1.1)
  const board = clamp((designDetails.boardThickness ?? 18) / 1000, 0.012, 0.04)
  const shelf = clamp((designDetails.shelfThickness ?? 18) / 1000, 0.012, 0.04)
  const doorThickness = clamp((designDetails.doorThickness ?? 18) / 1000, 0.012, 0.04)
  const columns = clamp(designDetails.compartmentColumns ?? layout.columns ?? 3, 1, 6)
  const rows = clamp(designDetails.compartmentRows ?? layout.rows ?? 3, 1, 8)
  const doorStyle = designDetails.doorStyle ?? "open"
  const shelfStyle = designDetails.shelfStyle ?? "grid"
  const handleStyle = designDetails.handleStyle ?? "edge-pull"
  const supportsSeatPad = product.id === "shoe-cabinet" && dimensions.height <= 1000
  const showSeatPad = Boolean(designDetails.seatPad && supportsSeatPad)
  const bodyMaterial = createMaterial(bodyColor)
  const edgeMaterial = createMaterial(darkerColor, { roughness: 0.74 })
  const backMaterial = createMaterial(lightColor, { transparent: true, opacity: designDetails.backPanel === "closed" ? 0.75 : 0.42 })
  const glassMaterial = createMaterial("#f7eee5", { transparent: true, opacity: 0.33, roughness: 0.18 })
  const handleMaterial = createMaterial("#8b5a2b", { roughness: 0.35, metalness: 0.12 })
  const lineMaterial = new THREE.LineBasicMaterial({ color: woodLine, transparent: true, opacity: 0.28 })
  const frontZ = depth / 2
  const backZ = -depth / 2
  const innerWidth = width - board * 2
  const innerHeight = height - board * 2
  const innerDepth = depth - board
  const cellWidth = innerWidth / columns
  const cellHeight = innerHeight / rows
  const isDesk = product.id === "study-desk"
  const isLow = ["tv-console", "sideboard"].includes(product.id)

  if (isDesk) {
    const topY = height * 0.72
    const drawerCount = clamp(designDetails.deskDrawerCount ?? designDetails.compartmentRows ?? 3, 1, 5)
    const legSize = Math.max(board * 1.45, 0.035)
    const legY = topY / 2
    const leftLegX = -width / 2 + board * 2
    const centerLegX = Math.min(width * 0.18, width / 2 - Math.min(width * 0.34, 0.52) - board * 2)
    const frontLegZ = depth / 2 - board * 1.8
    const backLegZ = -depth / 2 + board * 1.8
    addBox(group, { x: width, y: board * 1.4, z: depth }, { x: 0, y: topY, z: 0 }, bodyMaterial, "desk-top")
    const pedestalWidth = Math.min(width * 0.34, 0.52)

    ;[
      [leftLegX, frontLegZ],
      [leftLegX, backLegZ],
      [centerLegX, frontLegZ],
      [centerLegX, backLegZ],
    ].forEach(([x, z]) => {
      addBox(group, { x: legSize, y: topY, z: legSize }, { x, y: legY, z }, edgeMaterial, "desk-leg")
    })

    addBox(group, { x: pedestalWidth, y: topY, z: depth * 0.9 }, { x: width / 2 - pedestalWidth / 2, y: topY / 2, z: 0 }, bodyMaterial, "desk-pedestal")
    Array.from({ length: drawerCount }).forEach((_, index) => {
      const drawerHeight = topY / drawerCount
      const y = drawerHeight * index + drawerHeight / 2
      addBox(group, { x: pedestalWidth - board, y: drawerHeight - board, z: doorThickness }, { x: width / 2 - pedestalWidth / 2, y, z: frontZ + doorThickness / 2 }, glassMaterial, "drawer-front")
      addHandle(group, { x: width / 2 - pedestalWidth / 2, y, z: frontZ + doorThickness + 0.018 }, { x: 0.026, y: 0.16, z: 0.026 }, handleStyle, handleMaterial)
    })
    group.userData.bounds = { width, height, depth }
    return group
  }

  addBox(group, { x: board, y: height, z: depth }, { x: -width / 2 + board / 2, y: height / 2, z: 0 }, edgeMaterial, "left-side")
  addBox(group, { x: board, y: height, z: depth }, { x: width / 2 - board / 2, y: height / 2, z: 0 }, edgeMaterial, "right-side")
  addBox(group, { x: width, y: board, z: depth }, { x: 0, y: height - board / 2, z: 0 }, edgeMaterial, "top")
  addBox(group, { x: width, y: board, z: depth }, { x: 0, y: board / 2, z: 0 }, edgeMaterial, "bottom")

  if (designDetails.backPanel !== "none") {
    addBox(group, { x: innerWidth, y: innerHeight, z: board * 0.62 }, { x: 0, y: height / 2, z: backZ + board / 3 }, backMaterial, "back-panel")
  }

  if (shelfStyle !== "none") {
    Array.from({ length: rows - 1 }).forEach((_, index) => {
      const y = board + cellHeight * (index + 1)
      const shelfMesh = addBox(group, { x: innerWidth, y: shelf, z: innerDepth }, { x: 0, y, z: board / 2 }, bodyMaterial, "shelf")
      if (shelfStyle === "tilted") {
        shelfMesh.rotation.z = index % 2 === 0 ? -0.035 : 0.035
      }
    })
  }

  if (shelfStyle === "grid") {
    Array.from({ length: columns - 1 }).forEach((_, index) => {
      const x = -width / 2 + board + cellWidth * (index + 1)
      addBox(group, { x: board, y: innerHeight, z: innerDepth }, { x, y: height / 2, z: board / 2 }, bodyMaterial, "vertical-divider")
    })
  }

  const showDoors = doorStyle !== "open" && doorStyle !== "drawers"
  const showDrawers = doorStyle === "drawers" || (layout.drawers ?? 0) > 0
  const doorCount = showDoors ? columns : 0
  const doorCellWidth = doorCount > 0 ? innerWidth / doorCount : cellWidth
  const doorHeight = innerHeight
  const doorY = height / 2

  if (showDoors) {
    Array.from({ length: doorCount }).forEach((_, index) => {
      const x = -innerWidth / 2 + doorCellWidth * index + doorCellWidth / 2
      const doorWidth = Math.max(doorCellWidth - board * 0.6, 0.08)
      addBox(group, { x: doorWidth, y: doorHeight - board, z: doorThickness }, { x, y: doorY, z: frontZ + doorThickness / 2 }, glassMaterial, "door")
      addHandle(group, { x: x + doorWidth * 0.38, y: doorY, z: frontZ + doorThickness + 0.02 }, { x: 0.026, y: 0.2, z: 0.026 }, handleStyle, handleMaterial)
      if (doorStyle === "slatted" || designDetails.ventSlots) {
        addVentSlots(group, x, doorY - doorHeight * 0.18, frontZ + doorThickness + 0.024, doorWidth * 0.68, handleMaterial)
      }
    })
  }

  if (showDrawers) {
    const drawerCount = Math.max(2, Math.min(columns, layout.drawers || columns))
    const drawerCellWidth = innerWidth / drawerCount
    Array.from({ length: drawerCount }).forEach((_, index) => {
      const x = -innerWidth / 2 + drawerCellWidth * index + drawerCellWidth / 2
      addBox(group, { x: drawerCellWidth - board, y: cellHeight - board, z: doorThickness }, { x, y: board + cellHeight / 2, z: frontZ + doorThickness / 2 }, glassMaterial, "drawer")
      addHandle(group, { x, y: board + cellHeight / 2, z: frontZ + doorThickness + 0.02 }, { x: 0.026, y: 0.16, z: 0.026 }, handleStyle, handleMaterial)
    })
  }

  if (designDetails.cableHole) {
    const geometry = new THREE.TorusGeometry(0.055, 0.009, 12, 32)
    const mesh = new THREE.Mesh(geometry, handleMaterial.clone())
    mesh.position.set(width / 2 - board - 0.12, height - board - 0.18, backZ - 0.02)
    mesh.name = "cable-hole"
    mesh.userData.partId = "cable"
    group.add(mesh)
  }

  if (designDetails.toeKick || isLow) {
    addBox(group, { x: width - board * 5, y: 0.08, z: depth * 0.78 }, { x: 0, y: -0.04, z: -depth * 0.06 }, edgeMaterial, "toe-kick")
  }

  if (showSeatPad) {
    addBox(group, { x: width - board * 2, y: 0.08, z: depth * 0.94 }, { x: 0, y: height + 0.05, z: 0 }, createMaterial("#f4eee8", { roughness: 0.82 }), "seat-pad")
  }

  addWoodGrain(group, width, height, depth, lineMaterial)
  group.userData.bounds = { width, height: height + (showSeatPad ? 0.08 : 0), depth }

  return group
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => material.dispose())
    }
  })
}

function getCameraFitDistance(camera, bounds, aspect) {
  const verticalFov = THREE.MathUtils.degToRad(camera.fov)
  const safeAspect = Math.max(aspect || 1, 0.6)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * safeAspect)
  const fitHeight = bounds.y / (2 * Math.tan(verticalFov / 2))
  const fitWidth = bounds.x / (2 * Math.tan(horizontalFov / 2))
  const fitDepth = bounds.z * 1.35

  return Math.max(fitHeight, fitWidth, fitDepth, 1.45) * 1.55
}

function Cabinet3DPreview({ configuration, selectedPart = "overall", onPartSelect, className = "" }) {
  const mountRef = useRef(null)
  const frameRef = useRef(null)
  const dragRef = useRef({ active: false, x: 0, y: 0, distance: 0 })
  const yawRef = useRef(-0.55)
  const pitchRef = useRef(0.24)
  const zoomRef = useRef(1)
  const selectedPartRef = useRef(selectedPart)

  useEffect(() => {
    selectedPartRef.current = selectedPart

    if (selectedPart === "back" || selectedPart === "cable") {
      yawRef.current = Math.PI
      pitchRef.current = 0.2
      return
    }

    if (["door", "drawer", "handle", "shelf", "divider", "desktop", "legs", "deskStorage"].includes(selectedPart)) {
      yawRef.current = -0.15
      pitchRef.current = 0.22
    }
  }, [selectedPart])

  function zoomIn() {
    zoomRef.current = clamp(zoomRef.current * 0.82, 0.45, 1.85)
  }

  function zoomOut() {
    zoomRef.current = clamp(zoomRef.current * 1.18, 0.45, 1.85)
  }

  function resetView() {
    yawRef.current = -0.55
    pitchRef.current = 0.24
    zoomRef.current = 1
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f7f2ec")

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.HemisphereLight("#fff7ef", "#7a604a", 1.6)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.8)
    keyLight.position.set(3.2, 4.8, 4.2)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight("#e3bd95", 1.2)
    fillLight.position.set(-3.6, 2.6, -3.8)
    scene.add(fillLight)

    const floorGeometry = new THREE.PlaneGeometry(8, 8)
    const floorMaterial = createMaterial(floorColor, { roughness: 0.9 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.09
    floor.receiveShadow = true
    scene.add(floor)

    const wallGeometry = new THREE.PlaneGeometry(8, 4.8)
    const wallMaterial = createMaterial("#fbf8f3", { roughness: 0.9 })
    const wall = new THREE.Mesh(wallGeometry, wallMaterial)
    wall.position.set(0, 2.1, -1.35)
    wall.receiveShadow = true
    scene.add(wall)

    const productGroup = buildProductModel(configuration)
    scene.add(productGroup)

    const bounds = productGroup.userData.bounds ?? { width: 1.2, height: 1.8, depth: 0.4 }
    const canReference = addCanScaleReference(scene, bounds)
    const sceneBounds = new THREE.Box3().setFromObject(productGroup)
    sceneBounds.expandByObject(canReference)
    sceneBounds.expandByScalar(0.18)
    const boundSize = sceneBounds.getSize(new THREE.Vector3())
    const target = sceneBounds.getCenter(new THREE.Vector3())
    target.y = Math.max(target.y, bounds.height * 0.48)
    const baseRadiusRef = { current: getCameraFitDistance(camera, boundSize, 1) }

    function updateCamera() {
      const radius = baseRadiusRef.current * zoomRef.current
      const pitch = pitchRef.current
      const yaw = yawRef.current
      camera.position.set(
        target.x + Math.sin(yaw) * Math.cos(pitch) * radius,
        target.y + Math.sin(pitch) * radius,
        target.z + Math.cos(yaw) * Math.cos(pitch) * radius,
      )
      camera.lookAt(target)
    }
    updateCamera()

    function resize() {
      const rect = mount.getBoundingClientRect()
      const width = Math.max(Math.floor(rect.width || mount.clientWidth || 600), 320)
      const height = Math.max(Math.floor(rect.height || mount.clientHeight || 520), 320)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      baseRadiusRef.current = getCameraFitDistance(camera, boundSize, camera.aspect)
      updateCamera()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function pickPart(event) {
      if (!onPartSelect) {
        return
      }

      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const intersects = raycaster.intersectObjects(productGroup.children, true)
      const pickedMesh = intersects.find((item) => item.object?.userData?.partId)?.object
      if (pickedMesh?.userData?.partId) {
        onPartSelect(pickedMesh.userData.partId)
      }
    }

    function onPointerDown(event) {
      dragRef.current = { active: true, x: event.clientX, y: event.clientY, distance: 0 }
      renderer.domElement.setPointerCapture?.(event.pointerId)
    }

    function onPointerMove(event) {
      if (!dragRef.current.active) {
        return
      }
      const delta = event.clientX - dragRef.current.x
      const deltaY = event.clientY - dragRef.current.y
      dragRef.current.x = event.clientX
      dragRef.current.y = event.clientY
      dragRef.current.distance += Math.abs(delta) + Math.abs(deltaY)
      yawRef.current -= delta * 0.008
      pitchRef.current = clamp(pitchRef.current - deltaY * 0.006, -0.45, 1.05)
    }

    function onPointerUp(event) {
      if (dragRef.current.distance < 6) {
        pickPart(event)
      }
      dragRef.current.active = false
      renderer.domElement.releasePointerCapture?.(event.pointerId)
    }

    function onPointerLeave(event) {
      dragRef.current.active = false
      renderer.domElement.releasePointerCapture?.(event.pointerId)
    }

    function onWheel(event) {
      event.preventDefault()
      zoomRef.current = clamp(zoomRef.current + event.deltaY * 0.001, 0.45, 1.85)
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown)
    renderer.domElement.addEventListener("pointermove", onPointerMove)
    renderer.domElement.addEventListener("pointerup", onPointerUp)
    renderer.domElement.addEventListener("pointerleave", onPointerLeave)
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false })

    function animate() {
      updateCamera()
      productGroup.traverse((child) => {
        if (child.isMesh && child.material?.emissive) {
          const isSelected = child.userData.partId === selectedPartRef.current
          child.material.emissive.set(isSelected ? "#8a531e" : "#000000")
          child.material.emissiveIntensity = isSelected ? 0.18 : 0
        }
      })
      renderer.render(scene, camera)
      frameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      observer.disconnect()
      renderer.domElement.removeEventListener("pointerdown", onPointerDown)
      renderer.domElement.removeEventListener("pointermove", onPointerMove)
      renderer.domElement.removeEventListener("pointerup", onPointerUp)
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave)
      renderer.domElement.removeEventListener("wheel", onWheel)
      disposeObject(scene)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [configuration, onPartSelect])

  const { dimensions, material, color } = configuration

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#d7c3b5] bg-[#f7f2ec] shadow-[0_18px_70px_rgba(43,33,24,0.12)] ${className}`}>
      <div className="flex flex-col gap-3 border-b border-[#d7c3b5] bg-[#fbf8f3] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a35c36]">Mô hình 3D</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#241d16]">{configuration.productName}</h2>
          <p className="mt-1 text-sm text-[#6a5b4f]">
            {material.name} · {color.name}
          </p>
        </div>
        <div className="rounded-full border border-[#d7c3b5] bg-white px-4 py-2 text-sm font-semibold text-[#6a3f20]">
          {formatCmFromMm(dimensions.width)} x {formatCmFromMm(dimensions.height)} x {formatCmFromMm(dimensions.depth)} cm
        </div>
      </div>
      <div className="border-b border-[#ead8ca] bg-white px-5 py-3 text-sm text-[#735b2d]">
        Đang chọn: <strong>{partLabels[selectedPart] ?? partLabels.overall}</strong>. Bấm vào từng phần trên mô hình để chỉnh đúng thông số.
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button type="button" onClick={zoomIn} className="size-10 rounded-full border border-[#d7c3b5] bg-white text-lg font-bold text-[#854f19] shadow-sm">
            +
          </button>
          <button type="button" onClick={zoomOut} className="size-10 rounded-full border border-[#d7c3b5] bg-white text-lg font-bold text-[#854f19] shadow-sm">
            -
          </button>
          <button type="button" onClick={resetView} className="rounded-full border border-[#d7c3b5] bg-white px-4 text-sm font-bold text-[#854f19] shadow-sm">
            Góc chuẩn
          </button>
        </div>
        <div ref={mountRef} className="h-[min(58vh,520px)] min-h-[360px] w-full cursor-grab active:cursor-grabbing xl:h-full xl:min-h-0" />
      </div>
    </div>
  )
}

export default Cabinet3DPreview
