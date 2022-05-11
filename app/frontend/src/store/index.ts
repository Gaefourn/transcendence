import {combineReducers, configureStore} from "@reduxjs/toolkit";

import { api } from './api';
import {chatSlice, middleware} from 'store/chatSocket';
import { gameSlice } from 'store/gameSlice';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

const rootReducer = combineReducers({
  chat: chatSlice.reducer,
  game: gameSlice.reducer,
  [api.reducerPath]: api.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware : (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["chat.inner"]
      }
    }).concat([middleware, api.middleware]),
})

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

