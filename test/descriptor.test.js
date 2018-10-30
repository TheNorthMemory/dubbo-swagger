const should = require('should')
const jsYaml = require('js-yaml')
const { join } = require('path')
const { readFileSync } = require('fs')
const descriptor = require('../lib/descriptor')

describe('lib/descriptor.js', () => {

  let plusSpec = jsYaml.safeLoad(readFileSync(join(__dirname, `plus.test.yaml`)))
  it('transform `plus.test.yaml` with `x-object` works fine', () => {
  	descriptor({a: '1', b: '1'}, plusSpec).should.eql({
  		$class: 'com.foo.rpc.plus',
  		$: {
  			a: {$class: 'java.lang.Integer', $: 1},
  			b: {$class: 'java.lang.Integer', $: 1},
  		}
  	})
  })

  let minusSpec = jsYaml.safeLoad(readFileSync(join(__dirname, `minus.test.yaml`)))
  it('transform `minus.test.yaml` with `x-flat` works fine', () => {
  	descriptor({a: '1', b: '1'}, minusSpec).should.eql([
  		{ $class: 'java.lang.Integer', $: 1},
  		{ $class: 'java.lang.Integer', $: 1},
  	])
  })

  let complexSpec = jsYaml.safeLoad(readFileSync(join(__dirname, `complex.test.yaml`)))
  it('transform `complex.test.yaml` with `x-object`, `nullable`, `default` works fine', () => {
  	descriptor({a: '1', b: 'one', e: '2,3', f: '3.1415', h: '0.618', i: '{"J":"4","K":"two","L":["thee","four"],"M":{"N":"five","O":"5"}}'}, complexSpec).should.eql({
  		$class: 'com.foo.rpc.complex',
  		$: {
  			a: {$class: 'java.lang.Long', $: '1'},
  			b: {$class: 'java.lang.String', $: 'one'},
  			c: { $class: '[java.lang.String', $: [] },
  			e: {
          $class: '[java.lang.Long',
          $: [
            { $class: 'java.lang.Long', $: '2' },
            { $class: 'java.lang.Long', $: '3' }
          ]
        },
        f: { $class: 'java.lang.Double', $: 3.1415 },
        h: { $class: 'java.lang.Float', $: 0.618 },
        i: {
			    $class: '[io.dubbo.model.one',
			    $: [
			      {
			        J: { $class: 'java.lang.Long', $: '4' },
			        K: { $class: 'java.lang.String', $: 'two' },
			        L: {
			          $class: '[java.lang.String',
			          $: [
			            { $class: 'java.lang.String', $: 'thee' },
			            { $class: 'java.lang.String', $: 'four' }
			          ]
			        },
			        M: {
			          $class: 'io.dubbo.model.two',
			          $: {
			            N: { $class: 'java.lang.String', $: 'five' },
			            O: { $class: 'java.lang.Long', $: '5' }
			          }
			        }
			      }
			    ]
			  },
        p: {
        	$class: 'java.lang.Long',
        	$: '0'
        },
  		}
  	})
  })

})
