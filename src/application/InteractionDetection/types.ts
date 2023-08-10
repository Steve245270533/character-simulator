import type {Mesh} from "three";

export type Game_Mesh = Mesh & {
	userData: {
		type?: string,
		title?: string,
		url?: string
	}
}
