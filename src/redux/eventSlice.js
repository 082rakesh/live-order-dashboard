import { createSlice } from '@reduxjs/toolkit';

const eventSlice = createSlice({
	name: 'events',
	initialState: {
		eventList: [],
	},
	reducers: {
		addEvent: (state, action) => {
			// state.eventList.push(action.payload);
			state.eventList = [];
			state.eventList.unshift(action.payload);
			console.log('state.eventList ', state.eventList.length);
		},
	},
});

export const { addEvent } = eventSlice.actions;
export default eventSlice.reducer;
