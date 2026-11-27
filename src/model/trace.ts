// "Why did it do that?" A rule or action may report a step of its reasoning with the numbers it used.
// Nothing reads it except the dev harness (sidebar) and tests, so passing no trace changes nothing.
//   trace("ชนของ", "พลังงาน 2340 ft-lb ...")     steps with the same title in a row are shown as one group
export type Trace = (step: string, text: string) => void;
