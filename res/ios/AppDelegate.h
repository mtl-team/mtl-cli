//
//  AppDelegate.h
//  Debugging
//
//  Created by 姜振亚 on 2019/3/22.
//  Copyright © 2019 com.yonyou.debugging. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (readonly, strong) NSPersistentContainer *persistentContainer;

- (void)saveContext;

@end

