#include "NativeViewModelA.h"
#include "jsi/jsi.h"
#include "prism/container.hpp"
#include <memory>
#include <prism/rn/prismLog.h>
#include <prism/rn/prismRnJson.hpp>

namespace facebook::react
{

// NativeViewModelA constructor initializes the CxxSpec with the provided jsInvoker
NativeViewModelA::NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeViewModelACxxSpec(std::move(jsInvoker))
{
    prism::Container::get()->register_instance(jsInvoker);
}

// This function returns a jsi::String that echoes the input string
jsi::String NativeViewModelA::getStr(jsi::Runtime &rt, jsi::String input)
{
    LOG_DEBUG_F(rt, this->jsInvoker_, "get string with native view model A");
    return input;
}

// This function creates a jsi::Object from a PrismModelProxy<Test> instance
jsi::Object NativeViewModelA::NativeViewModelA::getObj(jsi::Runtime &rt)
{
    LOG_DEBUG_F(rt, this->jsInvoker_, "get object");
    if (!test_)
        test_ = std::make_shared<prismModelProxy_Test>();
    return jsi::Object::createFromHostObject(rt, test_);
}

jsi::Object NativeViewModelA::getArray(jsi::Runtime &rt)
{
    LOG_DEBUG_F(rt, this->jsInvoker_, "get array");
    if (!test_array)
    {
        test_array = std::make_shared<prismModelListProxy_Test>();
        test_array->list()->push_back(std::make_shared<prismModelProxy_Test>());
        test_array->list()->push_back(std::make_shared<prismModelProxy_Test>());
        test_array->list()->push_back(std::make_shared<prismModelProxy_Test>());
    }
    return jsi::Object::createFromHostObject(rt, test_array);
}

void NativeViewModelA::printObj(jsi::Runtime &rt)
{
    if (test_)
    {
        std::string json1 = prism::json::toJsonString(*test_->instance());
        LOG_DEBUG_F(rt, this->jsInvoker_, "json1 : {}", json1.c_str());
        std::shared_ptr<Test> des = prism::json::fromJsonString<Test>(json1);
        LOG_DEBUG_F(rt, this->jsInvoker_, "json2 : {}", prism::json::toJsonString(des).c_str());
    }
}

} // namespace facebook::react
