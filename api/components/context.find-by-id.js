'use strict';

const NoFlo = require('noflo');
const RedisDS = require('../datasources/redis.ds');
const PORT_IN = 'in';
const PORT_REDIS = 'redis';
const PORT_OUT = 'out';
const PORT_ERROR = 'error';

exports.getComponent = () => {

    const c = new NoFlo.Component();
    c.description = 'Get Context by id';
    c.icon = 'user';
    c.inPorts.add(PORT_IN, {
        datatype: 'object',
        description: 'Object with all parsed values.'
    });

    c.inPorts.add(PORT_REDIS, {
        datatype: 'object',
        description: 'Redis client'
    });

    c.outPorts.add(PORT_OUT, {
        datatype: 'object'
    });

    c.outPorts.add(PORT_ERROR, {
        datatype: 'object'
    });

    return c.process((input, output) => {

        if (!input.has(PORT_IN)) {
            return;
        }

        if (!input.has(PORT_REDIS)) {
            return;
        }
        const [{ sessionId }, redis] = input.getData(PORT_IN, PORT_REDIS);
        RedisDS
            .findAllByIdInList({
                redis,
                type: 'sessionContexts',
                subType: 'context',
                id: sessionId
            })
            .then((context) => {

                return output.sendDone({ [PORT_OUT]: context });
            })
            .catch((err) => {

                return output.sendDone({ [PORT_ERROR]: err });
            });

    });
};