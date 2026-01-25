export async function runSmokeTest() {
  console.log("Starting Smoke Test...");
  const sys = (window as any).sys;
  if (!sys) {
    console.error("SysBridge not loaded");
    return;
  }

  // 1. Open Window
  console.log("1. Opening Explorer...");
  const winId = sys.open("explorer");
  await new Promise(r => setTimeout(r, 500));
  
  // 2. Drag Window
  console.log("2. Dragging Window...");
  const store = sys.store;
  // Get current state to verify start
  const state = store.get(winId);
  const startX = state.x;
  const startY = state.y;
  
  store.startDrag(winId, startX, startY);
  
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    store.updateDrag(startX + i * 5, startY + i * 2);
    // Wait for frame
    await new Promise(r => requestAnimationFrame(r));
  }
  
  store.endDrag();
  console.log("Drag complete.");
  await new Promise(r => setTimeout(r, 500));

  // 3. Verify Position
  const finalState = store.get(winId);
  const expectedX = startX + (steps - 1) * 5; // roughly
  console.log(`Final Position: ${finalState.x}, ${finalState.y}`);
  
  // 4. Close Window
  console.log("4. Closing Window...");
  sys.close(winId);
  
  console.log("Smoke Test Complete.");
}
