'use strict';

import Bar from './Bar';
import dep from 'bower:dep/src/core';

class Foo extends Bar {
	hello() {
		return 'Hello ' + dep;
	}
}

export default Foo;
