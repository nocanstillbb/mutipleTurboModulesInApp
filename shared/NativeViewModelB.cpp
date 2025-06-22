#include "NativeViewModelB.h"
#include <prism/rn/prismLog.h>

namespace facebook::react
{

NativeViewModelB::NativeViewModelB(std::shared_ptr<CallInvoker> jsInvoker) : NativeViewModelBCxxSpec(std::move(jsInvoker))
{
}

} // namespace facebook::react
