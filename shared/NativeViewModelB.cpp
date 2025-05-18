#include "NativeViewModelB.h"
#include "log.h"

namespace facebook::react {

NativeViewModelB::NativeViewModelB(std::shared_ptr<CallInvoker> jsInvoker)
: NativeViewModelBCxxSpec(std::move(jsInvoker)) {}

jsi::String NativeViewModelB::getStr(jsi::Runtime &rt, jsi::String input)
{
  LOG_ERROR("get string with native view model B");
  return input;
}

} // namespace facebook::react
