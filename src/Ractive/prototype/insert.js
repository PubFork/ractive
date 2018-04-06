import hooks from 'src/events/Hook';
import { getElement } from 'utils/dom';

export default function Ractive$insert(target, anchor) {
  if (!this.fragment.rendered) {
    // TODO create, and link to, documentation explaining this
    throw new Error(
      'The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.'
    );
  }

  target = getElement(target);
  anchor = getElement(anchor) || null;

  if (!target) {
    throw new Error('You must specify a valid target to insert into');
  }

  target.insertBefore(this.detach(), anchor);
  this.el = target;

  (target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(this);
  this.isDetached = false;

  fireInsertHook(this);
}

function fireInsertHook(ractive) {
  hooks.insert.fire(ractive);

  ractive.findAllComponents('*').forEach(child => {
    fireInsertHook(child.instance);
  });
}
