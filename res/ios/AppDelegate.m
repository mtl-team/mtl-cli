//
//  AppDelegate.m
//  Debugging
//
//  Created by 姜振亚 on 2019/3/22.
//  Copyright © 2019 com.yonyou.debugging. All rights reserved.
//

#import "AppDelegate.h"
//Summer
#import <Mediator/Mediator.h>
#import <Cordova/CDV.h>
#import <Summer/Summer.h>
#import <IUMCore/IUMCore.h>
#import <IUMCommonUI/IUMCommonUI.h>
#import <ZipArchive/ZipArchive.h>

static NSString * ZIP_PASSWORD = @"d0441ca53bcc4a1220d031db69fc8c9b";

@interface AppDelegate ()

@end

@implementation AppDelegate

- (instancetype)init {
    
    if (self = [super init]) {
        
        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];
        
        int cacheSizeMemory = 8 * 1024 * 1024; // 8MB
        int cacheSizeDisk = 32 * 1024 * 1024; // 32MB
        NSURLCache *sharedCache = [[NSURLCache alloc] initWithMemoryCapacity:cacheSizeMemory diskCapacity:cacheSizeDisk diskPath:@"nsurlcache"];
        [NSURLCache setSharedURLCache:sharedCache];
    }
    return self;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    self.window.autoresizesSubviews = YES;
    UIViewController *vc = [[UIViewController alloc] init];
    vc.view.backgroundColor = [UIColor whiteColor];
    self.window.rootViewController = vc;//[[UINavigationController alloc] initWithRootViewController:vc];
    [self.window makeKeyAndVisible];
    
    [self getProjectJson];
    return YES;
}

-(void)getProjectJson{
    NSURL *url = [NSURL URLWithString:@"http://localhost:3000/project.json"];
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    configuration.timeoutIntervalForRequest = 60;
    NSURLSession *session = [NSURLSession sessionWithConfiguration: configuration delegate: nil delegateQueue: [NSOperationQueue mainQueue]];
    NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:url];
    [request setHTTPMethod:@"GET"];
    [request setValue:@"application/json" forHTTPHeaderField:@"content-Type"];
    [request setValue:@"application/json;charset=utf-8" forHTTPHeaderField:@"Accept"];
    
    NSURLSessionDataTask * dataTask =[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error == nil) {
            NSDictionary *responseObject = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:nil];
            if (responseObject && responseObject.count > 0) {
                NSString *domain = responseObject[@"config"][@"startPage"];
                NSString *Url = [NSString stringWithFormat:@"http://localhost:3000/%@",domain];
                UIViewController *vc = [[IUMMediator sharedInstance] Summer_viewControllerWithParams:@{@"startPage": Url}];
                self.window.rootViewController = [[UINavigationController alloc] initWithRootViewController:vc];
            }
        }else{
            [self showAlert];
        }
    }];
    [dataTask resume];
}

-(void)showAlert{
    UIAlertController *alertController=[UIAlertController alertControllerWithTitle:@"提示" message:@"请检查本地服务器是否启动！" preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *sureAction=[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self getProjectJson];
    }];
    [alertController addAction:sureAction];
    UIWindow   *alertWindow = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    alertWindow.rootViewController = [[UIViewController alloc] init];
    alertWindow.windowLevel = UIWindowLevelAlert + 1;
    [alertWindow makeKeyAndVisible];
    [alertWindow.rootViewController presentViewController:alertController animated:YES completion:nil];
}


// this happens while we are running ( in the background, or from within our own app )
// only valid if 40x-Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication*)application openURL:(NSURL*)url sourceApplication:(NSString*)sourceApplication annotation:(id)annotation
{
    if (!url) {
        return NO;
    }
    
    if ([url.host isEqualToString:@"evaluateJavaScript"]) {
        [self launchWithOpenURL:url];
        return YES;
    }
    
    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    
    return YES;
}

#if __IPHONE_OS_VERSION_MAX_ALLOWED < 90000
- (NSUInteger)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
#else
- (UIInterfaceOrientationMask)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
#endif
{
    // iPhone doesn't support upside down by default, while the iPad does.  Override to allow all orientations always, and let the root view controller decide what's allowed (the supported orientations mask gets intersected).
    NSUInteger supportedInterfaceOrientations = (1 << UIInterfaceOrientationPortrait) | (1 << UIInterfaceOrientationLandscapeLeft) | (1 << UIInterfaceOrientationLandscapeRight) | (1 << UIInterfaceOrientationPortraitUpsideDown);
    
    return supportedInterfaceOrientations;
}

#pragma mark - OpenURL

- (BOOL)launchWithOpenURL:(NSURL *)url {
    
    NSMutableDictionary *queries = [NSMutableDictionary dictionary];
    NSArray *queryComponents = [url.query componentsSeparatedByString:@"&"];
    for (NSString *queryComponent in queryComponents) {
        NSArray *components = [queryComponent componentsSeparatedByString:@"="];
        if (components.count == 2) {
            NSString *key = components[0];
            NSString *value = components[1];
            value = [value stringByRemovingPercentEncoding];
            id data = [value dataUsingEncoding:NSUTF8StringEncoding];
            id jsonObj = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:NULL] : nil;
            if (jsonObj) {
                value = jsonObj;
            }
            queries[key] = value;
        }
    }
    
    NSDictionary *args = queries[@"parameters"];
    NSString *function = args[@"function"];
    NSString *winId = args[@"winId"];
    NSString *frameId = args[@"frameId"];
    NSDictionary *parameters = args[@"parameters"];
    
    if (!([winId isKindOfClass:[NSString class]] || winId.length > 0)) {
        winId = @"root";
    }
    if (function.length > 0) {
        // 执行 js
        NSString *script = [[SUMJavaScriptBridge sharedInstance] scriptWithFunction:function object:parameters];
        NSString *tag = winId;
        if (frameId) {
            tag = [@[winId, frameId] componentsJoinedByString:SUMTagComponentSeparatorChar];
        }
        id vc = [[IUMMediator sharedInstance] Summer_viewControllerWithTag:tag];
        if (vc) {
            [(id<SUMViewController>)vc evaluateJavaScript:script completion:nil];
        }
        else {
            NSString *appid = [IUMAppContext sharedInstance].appid;
            BOOL wanshi = [appid isEqualToString:@"uculture"];
            if (wanshi) {
                // 存储 task
                NSString *account = @"Summer";
                NSString *key = @"schemeParameters";
                NSString *jsStringValue = [SUMJSSerialization jsStringWithObject:parameters];
                [[IUMSessionStorage sharedInstance] setItem:jsStringValue forAccount:account key:key];
            }
            else {
                vc = [[IUMMediator sharedInstance] Summer_launchViewController];
                __weak __typeof(vc) weakObj = vc;
                [(SUMCordovaController *)vc setFinishLoading:^(UIView *view) {
                    [(id<SUMViewController>)weakObj evaluateJavaScript:script completion:nil];
                }];
                self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
                self.window.autoresizesSubviews = YES;
                self.window.rootViewController = [[UINavigationController alloc] initWithRootViewController:vc];
                [self.window makeKeyAndVisible];
                return YES;
            }
        }
    }
    return NO;
}

- (UIViewController *)placeholderViewController {
    
    NSDictionary *launchImages = @{
                                   @480: @"LaunchImage-800-Portrait-736h@3x.png",
                                   @568: @"LaunchImage-700-568h@2x.png",
                                   @667: @"LaunchImage-800-667h@2x.png",
                                   @736: @"LaunchImage-800-Portrait-736h@3x.png",
                                   };
    CGFloat screenHeight = CGRectGetHeight([UIScreen mainScreen].bounds);
    NSString *imageName = launchImages[@(screenHeight)];
    UIImage *image = [UIImage imageNamed:imageName];
    UIViewController *viewController = [[UIViewController alloc] init];
    viewController.view = [[UIImageView alloc] initWithImage:image];
    return viewController;
}


- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
}


- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}


- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}


- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    // Saves changes in the application's managed object context before the application terminates.
    [self saveContext];
}


#pragma mark - Core Data stack

@synthesize persistentContainer = _persistentContainer;

- (NSPersistentContainer *)persistentContainer {
    // The persistent container for the application. This implementation creates and returns a container, having loaded the store for the application to it.
    @synchronized (self) {
        if (_persistentContainer == nil) {
            _persistentContainer = [[NSPersistentContainer alloc] initWithName:@"Debugging"];
            [_persistentContainer loadPersistentStoresWithCompletionHandler:^(NSPersistentStoreDescription *storeDescription, NSError *error) {
                if (error != nil) {
                    // Replace this implementation with code to handle the error appropriately.
                    // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
                    
                    /*
                     Typical reasons for an error here include:
                     * The parent directory does not exist, cannot be created, or disallows writing.
                     * The persistent store is not accessible, due to permissions or data protection when the device is locked.
                     * The device is out of space.
                     * The store could not be migrated to the current model version.
                     Check the error message to determine what the actual problem was.
                     */
                    NSLog(@"Unresolved error %@, %@", error, error.userInfo);
                    abort();
                }
            }];
        }
    }
    
    return _persistentContainer;
}

#pragma mark - Core Data Saving support

- (void)saveContext {
    NSManagedObjectContext *context = self.persistentContainer.viewContext;
    NSError *error = nil;
    if ([context hasChanges] && ![context save:&error]) {
        // Replace this implementation with code to handle the error appropriately.
        // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
        NSLog(@"Unresolved error %@, %@", error, error.userInfo);
        abort();
    }
}

@end
