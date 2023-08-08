import {BufferGeometry, Mesh, type NormalBufferAttributes} from "three";

import {MeshBVH} from "three-mesh-bvh";

export type BVHGeometry =  BufferGeometry<NormalBufferAttributes> & {boundsTree: MeshBVH}

export function isMesh(obj: unknown): obj is Mesh {
	return (typeof obj === "object" && obj !== null && "isMesh" in obj);
}
