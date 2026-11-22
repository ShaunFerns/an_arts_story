import assert from 'node:assert/strict';
import {makeCollisionWorld,barrierDimensions} from '../geo/collision.mjs';
const wall={id:'way/testwall',kind:'barrier',tags:{barrier:'wall'},coords:[[0,-6],[0,6]]};
const garden={id:'way/garden',kind:'barrier',tags:{barrier:'hedge',height:'1.2',width:'1.1'},coords:[[5,-3],[5,3]]};
const building={id:'way/building',kind:'building',tags:{building:'yes'},coords:[[10,-3],[16,-3],[16,3],[10,3],[10,-3]]};
const world=makeCollisionWorld([wall,garden,building],{playerRadius:.34,worldExtent:100});
assert.equal(barrierDimensions(wall.tags).width,.65);
assert.equal(barrierDimensions(garden.tags).width,1.1);
assert.equal(barrierDimensions(garden.tags).height,1.2);
assert.equal(world.query(-.6,0),null,'player safely clear of wall');
assert.equal(world.query(-.5,0)?.kind,'barrier','player collides before centre reaches wall line');
assert.equal(world.query(5.7,0)?.kind,'barrier','1.1 m wide hedge has real thickness');
assert.equal(world.query(9.8,0)?.kind,'building','capsule edge touches building before centre');
assert.equal(world.query(13,0)?.kind,'building','player cannot spawn inside building');
assert.equal(world.query(7,6),null,'non-adjacent open space remains walkable');
const cross=world.move(-2,0,4,0);
assert.ok(cross.x<-.55,'wall stops player even during a multi-metre step');
const slide=world.move(-.9,-4,1,2);
assert.ok(slide.y>-4,'wall permits glancing slide in the open direction');
const opening=makeCollisionWorld([
  {id:'wall/a',kind:'barrier',tags:{barrier:'wall',width:'1.0'},coords:[[0,-10],[0,-.65]]},
  {id:'wall/b',kind:'barrier',tags:{barrier:'wall',width:'1.0'},coords:[[0,.65],[0,10]]}
],{playerRadius:.34});
assert.ok(opening.query(0,0)!==null,'1.3m gap is too narrow with metre-wide wall ends and player radius');
const gate=makeCollisionWorld([
  {id:'wall/c',kind:'barrier',tags:{barrier:'wall',width:'1.0'},coords:[[0,-10],[0,-1.6]]},
  {id:'wall/d',kind:'barrier',tags:{barrier:'wall',width:'1.0'},coords:[[0,1.6],[0,10]]}
],{playerRadius:.34});
assert.equal(gate.query(0,0),null,'wide gate remains passable');
console.log('PASS: metre-based capsule footprint, wall widths, hedge sizes, building edges, sliding and gates');