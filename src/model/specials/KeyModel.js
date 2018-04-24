import { addToArray, removeFromArray } from 'utils/array';
import { unescapeKey } from 'shared/keypaths';
import { capture } from 'src/global/capture';
import { handleChange } from 'src/shared/methodCallers';
import noop from 'utils/noop';

export default class KeyModel {
  constructor(value, context, instance) {
    this.value = this.key = value;
    this.context = context;
    this.isReadonly = this.isKey = true;
    this.deps = [];
    this.links = [];
    this.children = [];
    this.instance = instance;
  }

  applyValue(value) {
    if (value !== this.value) {
      this.value = this.key = value;
      this.deps.forEach(handleChange);
      this.links.forEach(handleChange);
      this.children.forEach(c => {
        c.applyValue(c.context.getKeypath(c.instance));
      });
    }
  }

  destroyed() {
    if (this.upstream) this.upstream.unregisterChild(this);
  }

  get(shouldCapture) {
    if (shouldCapture) capture(this);
    return unescapeKey(this.value);
  }

  getKeypath() {
    return unescapeKey(this.value);
  }

  has() {
    return false;
  }

  rebind(next, previous) {
    let i = this.deps.length;
    while (i--) this.deps[i].rebind(next, previous, false);

    i = this.links.length;
    while (i--) this.links[i].relinking(next, false);
  }

  register(dependant) {
    this.deps.push(dependant);
  }

  registerChild(child) {
    addToArray(this.children, child);
    child.upstream = this;
  }

  registerLink(link) {
    addToArray(this.links, link);
  }

  unregister(dependant) {
    removeFromArray(this.deps, dependant);
  }

  unregisterChild(child) {
    removeFromArray(this.children, child);
  }

  unregisterLink(link) {
    removeFromArray(this.links, link);
  }
}

KeyModel.prototype.reference = noop;
KeyModel.prototype.unreference = noop;
