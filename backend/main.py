import uvicorn
import logging


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    logging.debug('Starting main.py')
    logging.info('Launching Uvicorn server for api:app...')
    uvicorn.run('api:app', host='0.0.0.0', port=8000, reload=True)