import importlib
import inspect
import logging
import sys
from types import ModuleType
from typing import Any, Dict, List, Optional, Tuple, Union

import structlog

logger = structlog.get_logger(__name__)


def _extract_attributes(
    obj_type: str,
    obj_name: str,
    obj_value: Any,
    names: Dict[str, Dict[str, str]],
    uppercase_only: bool,
    warn_duplicates: bool,
    exclude_names: List[str],
) -> None:
    # List attributes and other things
    for member_name, member in inspect.getmembers(obj_value):
        if (
            type(member) == ModuleType
            or member_name.startswith("__")
            or (uppercase_only and not member_name.isupper())
            or member_name in exclude_names
        ):
            continue

        if member_name in names.keys():
            if warn_duplicates:
                logging.warning(
                    f"Duplicate module member name '{member_name}' found in module '{obj_name}'. Member exists in '{names[member_name]}'."
                )
            continue

        names[member_name] = {"type": obj_type, "value": obj_name}


def flatten_module_attributes(
    module: ModuleType,
    imports: List[str],
    extra_imports: Optional[List[Union[str, Tuple[str, str]]]] = None,
    prefix: Optional[str] = None,
    warn_duplicates: bool = False,
    uppercase_only: bool = True,
    exclude_names: Optional[List[str]] = None,
) -> None:
    """
    Flatten the attributes of imports and other objects to module attributes.

    This function will take a module (parent module) which has other modules
    imported (child modules), and flatten the attributes of the child modules,
    or a subset of child modules so their attributes appear as if they are in
    the parent module. When `getattr` is called on the parent module, `getattr`
    will be called against the child module for the attribute requested.

    If a list of modules is provided and a prefix is provided, only modules
    names begin with the prefix will be flattened.

    The `extra_imports` list can be used to pass in the names (str) of other
    child modules or objects in child modules (tuple) to flatten.

    Args:
        module: Module to be flattened
        imports: Imported modules whose attributes should be flattened
        extra_imports: Additional modules or classes whose attributes should be flattened
        prefix: Prefix of imports to include when flattening imported modules
        warn_duplicates: Warn if duplicate attribute names are encountered, default: `False`
        uppercase_only: Only flatten attributes which are upper case, default: `True`
        exclude_names: Names to not flatten to the module when encountered

    Returns:

    """
    if not extra_imports:
        extra_imports = []
    if not exclude_names:
        exclude_names = []
    default_getattr_name = "__getattr_original__"
    names: Dict[str, Dict[str, str]] = {}

    objects_by_name: Dict[str, Any] = {}
    for i in extra_imports:
        # These extra imports avoid module locks in the parent module
        if isinstance(i, tuple):
            imported = getattr(importlib.import_module(i[0]), i[1])
            objects_by_name[f"{i[0]}.{i[1]}"] = imported
        elif isinstance(i, str):
            imported = importlib.import_module(i)
            objects_by_name[f"{i}"] = imported
        else:
            raise TypeError(
                "extra_imports requires a list containing module names (str) or module name and attribute (tuple)."
            )

    if not isinstance(module, ModuleType) or module.__name__ == "__main__":
        return

    for imported_module in imports:
        if (
            prefix
            and not imported_module.startswith(prefix)
            or imported_module == __name__
        ):
            continue

        _extract_attributes(
            obj_type="module",
            obj_name=imported_module,
            obj_value=sys.modules[imported_module],
            names=names,
            uppercase_only=uppercase_only,
            warn_duplicates=warn_duplicates,
            exclude_names=exclude_names,
        )

    for obj_name in objects_by_name.keys():
        _extract_attributes(
            obj_type="object",
            obj_name=obj_name,
            obj_value=objects_by_name[obj_name],
            names=names,
            uppercase_only=uppercase_only,
            warn_duplicates=warn_duplicates,
            exclude_names=exclude_names,
        )

    def error_getattr(name: str) -> None:
        raise AttributeError(f"module '{module.__name__}' has no attribute '{name}'")

    def flat_dir() -> List[str]:
        return sorted(set(module.__dict__.keys()).union(set(names.keys())))

    def flat_getattr(name: str) -> Any:
        if name not in names.keys():
            return getattr(module, "__getattr_original__")(name)

        if name in names.keys() and names[name].get("type") == "module":
            mod_name = names[name].get("value")
            assert isinstance(mod_name, str)
            return getattr(sys.modules[mod_name], name)
        if name in names.keys() and names[name].get("type") == "object":
            obj_name = names[name].get("value")
            assert isinstance(obj_name, str)
            return getattr(objects_by_name[obj_name], name)

        return error_getattr(name)

    _getattr = getattr(module, "__getattr__", error_getattr)
    setattr(module, default_getattr_name, _getattr)
    setattr(module, "__getattr__", flat_getattr)
    setattr(module, "__dir__", flat_dir)
