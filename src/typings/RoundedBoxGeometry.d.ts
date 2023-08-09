declare module "three/examples/jsm/geometries/RoundedBoxGeometry" {
	import {BoxGeometry} from "three";

	export class RoundedBoxGeometry extends BoxGeometry {
		constructor(width?: number, height?: number, depth?: number, segments?: number, radius?: number);
	}
}
