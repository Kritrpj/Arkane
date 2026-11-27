// Feature "zones": game.arkane.core.zones + its GM hooks (expiry, auto report)
import { closeConcentration, createZone, currentClock, inspectPoint, labelRegion, registerZoneHooks, removeZones, reportZones, setAutoReport, sweepZones } from "../foundry/zones";

export function register(core: any): void {
  const sc = () => canvas.scene;
  // ฝั่ง GM เท่านั้น (Region แก้ได้เฉพาะ GM) ใช้จาก console หรือมาโคร; ผู้เล่นจะผ่าน Effect zone ในขั้นถัดไป
  core.zones = {
    create: (z: any) => createZone(sc(), z), label: (regionId: string, kind: string, extra?: any) => labelRegion(sc(), regionId, kind, extra),
    remove: (ids: string[]) => removeZones(sc(), ids), sweep: () => sweepZones(sc(), currentClock()),
    closeConcentration: (casterId: string) => closeConcentration(sc(), casterId), at: (x: number, y: number) => inspectPoint(sc(), x, y),
    report: (tokenId?: string) => reportZones(sc(), tokenId), autoReport: setAutoReport,
  };
  registerZoneHooks();
}
