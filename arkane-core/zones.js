/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  closeConcentration,
  createZone,
  currentClock,
  inspectPoint,
  labelRegion,
  registerZoneHooks,
  removeZones,
  reportZones,
  setAutoReport,
  sweepZones
} from "./chunks/chunk-YYXYPINZ.js";
import "./chunks/chunk-HNCV3QLI.js";
import "./chunks/chunk-VELQ4LWX.js";

// src/features/zones.ts
function register(core) {
  const sc = () => canvas.scene;
  core.zones = {
    create: (z) => createZone(sc(), z),
    label: (regionId, kind, extra) => labelRegion(sc(), regionId, kind, extra),
    remove: (ids) => removeZones(sc(), ids),
    sweep: () => sweepZones(sc(), currentClock()),
    closeConcentration: (casterId) => closeConcentration(sc(), casterId),
    at: (x, y) => inspectPoint(sc(), x, y),
    report: (tokenId) => reportZones(sc(), tokenId),
    autoReport: setAutoReport
  };
  registerZoneHooks();
}
export {
  register
};
