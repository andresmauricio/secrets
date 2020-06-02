#!/usr/bin/env node
'use strict'

const minimist = require('minimist');
const { createDb } = require('./lib/database');
const arvg = minimist(process.argv.slice(2));


async function main() {
    const db = await createDb();
    const command = arvg._.shift();

    switch (command) {
      case 'users:create':
        try {
          const { user, pass } = arvg;
          await db.createUser(user, pass);
          console.log(`${user} created`);
        }catch(error) {
          throw new Error('Cannot create user');
        }
        break
      case 'users:list':
        try {
          const result = await db.listUsers();
          if (!result || !result.users || !result.users.length) return console.log('No users found');
          result.users.forEach( user => {
            console.log(`- ${user.user}`);
          });
          console.log(`Total: ${result.count}`)
        } catch (error) {
          throw new Error('Cannot list users');
        }
        break
      case 'secrets:create':
        try {
          const { user, name, value } = arvg;
          await db.createSecret(user, name, value);
          console.log(`secret: ${name} created`);
        } catch (error) {
          throw new Error('Cannot create secret');
        }
        break
      case 'secrets:list':
        try {
          const { user } = arvg;
          const secrets = await db.listSecrets(user);
          secrets.forEach(secret => {
            console.log(`- ${secret.name}`);
            
          })          
        } catch (error) {
          throw new Error('Cannot list secrets');
        }
        break
        case 'secrets:get':
          try {
            const { user, name } = arvg;
            const secret = await db.getSecret(user, name);
            if (!secret) return console.log(`secret ${name} not found`);
            console.log(`- ${secret.name} = ${secret.value}`);
            } catch (error) {
            throw new Error('Cannot get secret');
          }
          break
          case 'secrets:update':
            try {
              const { user, name, value } = arvg;
              await db.updateSecret(user, name, value);
              console.log(`secret: ${name} updated`);
              } catch (error) {
              throw new Error('Cannot update secret');
            }
            break
            case 'secrets:delete':
              try {
                const { user, name } = arvg;
                await db.deleteSecret(user, name);
                console.log(`secret: ${name} deleted`);
                } catch (error) {
                throw new Error('Cannot deleted secret');
              }
              break
      default:
        console.error(`command not found: ${command}`); 
    }
}

main().catch( error =>  console.log(error) )
