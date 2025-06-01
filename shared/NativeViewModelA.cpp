#include "NativeViewModelA.h"
#include <prism/rn/prismRnJson.hpp>
#include <prism/rn/prismLog.h>
#include "prism/container.hpp"

namespace facebook::react {

NativeViewModelA::NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker)
: NativeViewModelACxxSpec(std::move(jsInvoker)) {
  prism::Container::get()->register_instance(jsInvoker);
}

jsi::String NativeViewModelA::getStr(jsi::Runtime &rt, jsi::String input)
{
  LOG_DEBUG_F(rt,this->jsInvoker_, "get string with native view model A");
  return input;
}

jsi::Object NativeViewModelA::NativeViewModelA::getObj(jsi::Runtime &rt)
{
  LOG_INFO_F(rt,this->jsInvoker_,"get object");
  if(!test_)
    test_ = std::make_shared<prismModelProxy_Test>();
  return jsi::Object::createFromHostObject(rt, test_);
}

void NativeViewModelA::printObj(jsi::Runtime &rt){
  if(test_)
  {
    std::string json1 =prism::json::toJsonString(*test_->instance());
    LOG_ERROR_F(rt,this->jsInvoker_,"json1 : {}",json1.c_str());
    std::shared_ptr<Test> des = prism::json::fromJsonString<Test>(json1);
    LOG_ERROR_F(rt,this->jsInvoker_,"json2 : {}",prism::json::toJsonString(des).c_str());
  }
}


} // namespace facebook::react
