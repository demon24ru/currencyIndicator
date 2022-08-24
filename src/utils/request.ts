import {extend, RequestOptionsInit} from 'umi-request';
import { notification } from 'antd';
import config from '../config';

const codeMessage: { [key: number]: string } = {
  200: 'Нет Ошибок.',
  201: 'Успешное изменение.',
  202: 'Запрос помещен в очередь.',
  204: 'Данные удалены.',
  400: 'Ошибка запроса.',
  401: 'Недостаточно прав доступа.',
  403: 'Неверные автаризационные данные!',
  404: 'Не найдено.',
  406: 'Запрашиваемый формат недоступен.',
  410: 'Ресурс удален и больше небудет доступен.',
  422: 'При создании объекта, произошла ошибка.',
  500: 'Произошла ошибка на сервере, пожалуйста, проверьте сервер.',
  502: 'Ошибка шлюза.',
  503: 'Сервис недоступен, сервер временно перегружен или обслуживается.',
  504: 'Тайм-аут шлюза.',
};


const errorHandler = (error: { data?: any; response?: { status?: number, statusText: string }; }) => {
  const { response } = error;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status } = response;
    if (response.status !== 401)
      notification.error({
        message: `Ошибка ${status}:`,
        description: error.data.message || errorText,
      });
  } else if (!response) {
    notification.error({
      description: 'Нет подключения!',
      message: 'Сетевая Ошибка',
    });
    throw new Error();
  }

  throw response;
};

const errorHandlerQuiet = (error: { response?: any; }) => {
  const { response } = error;
  if (!response)
    throw new Error();
  else throw response;
};



const req = function(quiet = false) {
  const headers: any = {
    'Accept': 'application/json',
    'Content-Type': 'text/plain;charset=UTF-8'
  };

  return extend({
    errorHandler: quiet ? errorHandlerQuiet : errorHandler,
    headers,
    prefix: config.server
  });
}


export const request = function<T> (path: string, options?: RequestOptionsInit): Promise<T> {
  return req(options && options.quiet)(path, options);
}
