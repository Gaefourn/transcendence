import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InviteDTO } from "./dtos";

type SerializableMap<V> = {[id:string]:V};

export const gameSlice = createSlice({
	name: "game",
	initialState: {
		// userId: undefined as string|undefined,
		isMatching: false,
		outInvite: {} as SerializableMap<InviteDTO>,
		inInvite:  {} as SerializableMap<InviteDTO>,
	},
	reducers: {
		setIsMatching(state, action:PayloadAction<boolean>){
			state.isMatching = action.payload;
		},
		RemoveInvite(state, action:PayloadAction<string>){
			delete state.outInvite[action.payload];
			delete state.inInvite[action.payload];
		},
		InviteReceived(state, action:PayloadAction<InviteDTO>){
			state.inInvite[action.payload.id]  = action.payload;
		},
		InviteSent(state, action:PayloadAction<InviteDTO>){
			state.outInvite[action.payload.id] = action.payload;
		},
	},
});

export const {
	setIsMatching,

	RemoveInvite,
	InviteReceived,
	InviteSent,
} = gameSlice.actions;
