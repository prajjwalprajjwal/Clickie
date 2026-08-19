#ifndef OS_MANAGER_H
#define OS_MANAGER_H

#include <Arduino.h>
#include "Applet.h"
#include "InputManager.h"

class OSManager {
public:
    enum SleepState {
        AWAKE,
        LIGHT_SLEEP,
        DEEP_SLEEP
    };

private:
    Applet* applets[10];
    uint8_t appletCount = 0;
    uint8_t currentAppletIndex = 0;
    Applet* currentApplet = nullptr;
    InputManager inputManager;
    
    // Sleep management
    SleepState sleepState = AWAKE;
    uint32_t lastActivityTime = 0;
    uint32_t lightSleepTimeout = 20000;    // 20 seconds before light sleep (DEBUG)
    uint32_t deepSleepTimeout = 45000;     // 45 seconds before deep sleep (DEBUG)
    bool displayOn = true;

public:
    OSManager();
    void init();
    void update();
    void draw();
    
    void registerApplet(Applet* applet);
    void switchToApplet(uint8_t index);
    void switchToNextApplet();
    Applet* getCurrentApplet() { return currentApplet; }
    InputManager* getInputManager() { return &inputManager; }
    
    // Sleep/wake functions
    void recordActivity();
    void enterLightSleep();
    void wakeFromLightSleep();
    void enterDeepSleep();
    void wakeFromDeepSleep();
    SleepState getSleepState() const { return sleepState; }
    bool isDisplayOn() const { return displayOn; }
    void setLightSleepTimeout(uint32_t ms) { lightSleepTimeout = ms; }
    void setDeepSleepTimeout(uint32_t ms) { deepSleepTimeout = ms; }

private:
    void checkSleepConditions();
};

#endif // OS_MANAGER_H
