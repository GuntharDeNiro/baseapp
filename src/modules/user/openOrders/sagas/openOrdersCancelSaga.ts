// tslint:disable-next-line
import { call, put } from 'redux-saga/effects';
import { API, RequestOptions } from '../../../../api';
import { alertPush } from '../../../public/alert';
import { openOrdersCancelError, OpenOrdersCancelFetch } from '../actions';


const ordersCancelOptions: RequestOptions = {
    apiVersion: 'peatio',
};

export function* openOrdersCancelSaga(action: OpenOrdersCancelFetch) {
    try {
        const { id } = action.payload;
        yield call(API.post(ordersCancelOptions), `/market/orders/${id}/cancel`, { id });
        yield put(alertPush({ message: ['success.order.cancelling'], type: 'success'}));
    } catch (error) {
        yield put(openOrdersCancelError());
        yield put(alertPush({message: error.message, code: error.code, type: 'error'}));
    }
}
