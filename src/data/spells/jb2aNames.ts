// ชื่อเอฟเฟกต์ JB2A (ชื่อใน Sequencer database) ของทุกสกิลที่ตัวละครในโต๊ะมี: ที่เดียว แก้ที่นี่ที่เดียว
// - seq = ลองตามลำดับ ตัวแรกที่ "มีจริง" ในเครื่องชนะ ตัวที่ไม่มีข้ามไปเอง (ไม่พัง) ไม่มีสักตัว = ใช้ไฟล์ที่สแกน (npm run fx) แล้วเส้นสำรอง `line`
// - ชื่อด้านล่าง **เขียนจากความจำ ยังไม่ได้เทียบกับ DB จริง**: ที่ลงท้าย // เดา คือเดาตามแบบ jb2a.<ชื่อสกิล>.<สี> ที่ JB2A ใช้
//   ตรวจ: game.arkane.core.castFx.audit() (✓ = เจอ, ✗ = ได้แค่เส้น) แล้วหาชื่อจริงด้วย game.arkane.core.castFx.db("jb2a.fire_bolt") / Database Viewer ของ Sequencer
//   เจอชื่อที่ถูก: แก้บรรทัดนี้ได้เลย · ใน harness ชื่อ seq จับคู่กับไฟล์ใน dev/fx ที่ path มีคำเดียวกัน (jb2a.fire_bolt.orange <-> Fire_Bolt/..._Orange_...)
// - line = สีของเส้นสำรอง (ใช้เมื่อสกิลยังไม่มี line ของตัวเอง)
export const JB2A: Record<string, { seq: string[]; line?: string }> = {
  // ---- cantrip
  "fire-bolt": { seq: ["jb2a.fire_bolt.orange"], line: "#ff7a2a" },
  "eldritch-blast": { seq: ["jb2a.eldritch_blast.purple"], line: "#d02a4a" },
  "shocking-grasp": { seq: ["jb2a.shocking_grasp.blue"], line: "#9fd8ff" },
  "message": { seq: ["jb2a.markers.light.complete.blue"], line: "#9fd8ff" },                                   // เดา
  "minor-illusion": { seq: ["jb2a.markers.light.complete.purple"], line: "#b46aff" },                          // เดา
  "guidance": { seq: ["jb2a.guidance.hand.blue", "jb2a.markers.light.complete.yellow"], line: "#ffd84a" },    // เดา
  "druidcraft": { seq: ["jb2a.markers.light.complete.green"], line: "#4cff7a" },                               // เดา
  "dancing-lights": { seq: ["jb2a.dancing_light.blueteal", "jb2a.dancing_light.yellow"], line: "#8fe8ff" },
  "mending": { seq: ["jb2a.markers.light.complete.yellow"], line: "#ffd84a" },                                 // เดา
  "mind-sliver": { seq: ["jb2a.mind_sliver.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" }, // เดา
  "prestidigitation": { seq: ["jb2a.markers.light.complete.white"], line: "#ffffff" },                        // เดา
  // ---- level 1
  "shield": { seq: ["jb2a.shield.01.complete.blue", "jb2a.shield.01.intro.blue"], line: "#5aa9ff" },
  "magic-missile": { seq: ["jb2a.magic_missile.purple", "jb2a.magic_missile.blue"], line: "#c9a0ff" },
  "hex": { seq: ["jb2a.hex.purple", "jb2a.markers.curse.purple"], line: "#7a2aa0" },                          // เดา
  "sleep": { seq: ["jb2a.sleep.blue"], line: "#6aa0ff" },                                                      // เดา
  "healing-word": { seq: ["jb2a.healing_generic.200px.green", "jb2a.cure_wounds.400px.blue"], line: "#7aff9a" },
  "cure-wounds": { seq: ["jb2a.cure_wounds.400px.blue", "jb2a.healing_generic.200px.green"], line: "#7aff9a" },
  "disguise-self": { seq: ["jb2a.disguise_self.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" }, // เดา
  "hunters-mark": { seq: ["jb2a.hunters_mark.pulse.01.green", "jb2a.hunters_mark.mark.01.green"], line: "#4cff7a" },
  "ensnaring-strike": { seq: ["jb2a.ensnaring_strike.reversed.blue", "jb2a.entangle.green"], line: "#4cff7a" },
  "grease": { seq: ["jb2a.grease.dark_brown.loop", "jb2a.grease.top.brown"], line: "#8a6a3a" },                 // เดา
  "faerie-fire": { seq: ["jb2a.faerie_fire.green", "jb2a.markers.light.complete.green"], line: "#9aff6a" },    // เดา
  "detect-magic": { seq: ["jb2a.detect_magic.circle.blue", "jb2a.detect_magic.cone.blue"], line: "#5aa9ff" },
  "arms-of-hadar": { seq: ["jb2a.arms_of_hadar.dark_purple"], line: "#5a2a7a" },
  "dissonant-whispers": { seq: ["jb2a.dissonant_whispers.01.purple"], line: "#b46aff" },
  "speak-with-animals": { seq: ["jb2a.speak_with_animals.green", "jb2a.markers.light.complete.green"], line: "#4cff7a" }, // เดา
  "fog-cloud": { seq: ["jb2a.fog_cloud.01.white", "jb2a.fog_cloud.02.white"], line: "#dfe8f0" },
  "alarm": { seq: ["jb2a.alarm.blue", "jb2a.markers.light.complete.blue"], line: "#5aa9ff" },                  // เดา
  // ---- level 2
  "calm-emotions": { seq: ["jb2a.calm_emotions.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" }, // เดา
  "detect-thoughts": { seq: ["jb2a.detect_thoughts.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" }, // เดา
  "mirror-image": { seq: ["jb2a.mirror_image.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" },   // เดา
  "misty-step": { seq: ["jb2a.misty_step.01.blue", "jb2a.misty_step.02.blue"], line: "#9fd8ff" },
  "hold-person": { seq: ["jb2a.hold_person.blue", "jb2a.markers.chain.standard.loop.01.blue"], line: "#9fd8ff" }, // เดา
  "rope-trick": { seq: ["jb2a.rope_trick.blue", "jb2a.markers.light.complete.blue"], line: "#c9a06a" },        // เดา
  "darkness": { seq: ["jb2a.darkness.black", "jb2a.darkness.blue"], line: "#222233" },                         // เดา
  "pass-without-trace": { seq: ["jb2a.pass_without_trace.green", "jb2a.markers.light.complete.green"], line: "#4cff7a" }, // เดา
  "spike-growth": { seq: ["jb2a.spike_growth.green", "jb2a.markers.light.complete.green"], line: "#6aa04a" }, // เดา
  // ---- level 3
  "hunger-of-hadar": { seq: ["jb2a.hunger_of_hadar.dark_purple", "jb2a.darkness.black"], line: "#3a1a5a" },  // เดา
  "sending": { seq: ["jb2a.sending.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" },             // เดา
  "fireball": { seq: ["jb2a.fireball.explosion.orange"], line: "#ff7a2a" },
  "counterspell": { seq: ["jb2a.counterspell.complete.blueyellow", "jb2a.counterspell.blue"], line: "#5aa9ff" },
};
