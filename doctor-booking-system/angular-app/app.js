(function () {
  "use strict";

  var API = "http://localhost:5000/api";

  var app = angular.module("doctorBookingApp", ["ngRoute"]);

  // ─── Route Config ──────────────────────────────────────────────────────────
  app.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when("/", { templateUrl: "home.html", controller: "HomeController" })
      .when("/doctor/:id", { templateUrl: "doctor.html", controller: "DoctorController" })
      .when("/appointments", { templateUrl: "appointments.html", controller: "AppointmentsController" })
      .when("/auth", { templateUrl: "auth.html", controller: "AuthController" })
      .otherwise({ redirectTo: "/" });
  }]);

  // ─── AuthService ───────────────────────────────────────────────────────────
  app.service("AuthService", ["$http", function ($http) {
    this.getToken = function () {
      return localStorage.getItem("carepoint_token");
    };

    this.getUser = function () {
      try {
        return JSON.parse(localStorage.getItem("carepoint_user") || "null");
      } catch { return null; }
    };

    this.isLoggedIn = function () {
      return !!this.getToken();
    };

    this.saveAuth = function (token, user) {
      localStorage.setItem("carepoint_token", token);
      localStorage.setItem("carepoint_user", JSON.stringify(user));
    };

    this.logout = function () {
      localStorage.removeItem("carepoint_token");
      localStorage.removeItem("carepoint_user");
    };

    this.authHeader = function () {
      var token = this.getToken();
      return token ? { "Authorization": "Bearer " + token } : {};
    };

    this.register = function (data) {
      return $http.post(API + "/auth/register", data);
    };

    this.login = function (data) {
      return $http.post(API + "/auth/login", data);
    };
  }]);

  // ─── DoctorService ─────────────────────────────────────────────────────────
  app.service("DoctorService", ["$http", "AuthService", function ($http, AuthService) {
    this.getDoctors = function (params) {
      return $http.get(API + "/doctors", { params: params || {} });
    };

    this.getDoctor = function (id) {
      return $http.get(API + "/doctors/" + id);
    };

    this.bookAppointment = function (data) {
      return $http.post(API + "/appointments", data, {
        headers: AuthService.authHeader()
      });
    };

    this.getAppointments = function () {
      return $http.get(API + "/appointments", {
        headers: AuthService.authHeader()
      });
    };

    this.cancelAppointment = function (id) {
      return $http.delete(API + "/appointments/" + id, {
        headers: AuthService.authHeader()
      });
    };
  }]);

  // ─── NavController ─────────────────────────────────────────────────────────
  app.controller("NavController", ["$scope", "$location", "AuthService", function ($scope, $location, AuthService) {
    $scope.user = AuthService.getUser();

    $scope.$on("userChanged", function () {
      $scope.user = AuthService.getUser();
    });

    $scope.logout = function () {
      AuthService.logout();
      $scope.user = null;
      $scope.$broadcast("userChanged");
      $location.path("/");
    };

    $scope.goToAuth = function () {
      $location.path("/auth");
    };
  }]);

  // ─── HomeController ────────────────────────────────────────────────────────
  app.controller("HomeController", ["$scope", "$rootScope", "DoctorService", "AuthService", function ($scope, $rootScope, DoctorService, AuthService) {
    $scope.doctors = [];
    $scope.loading = true;
    $scope.error = "";
    $scope.searchText = "";

    $scope.user = AuthService.getUser();

    $scope.initials = function (name) {
      if (!name) return "DR";
      return name.split(" ").slice(1).map(function (x) { return x[0]; }).join("").slice(0, 2).toUpperCase();
    };

    DoctorService.getDoctors().then(function (response) {
      $scope.doctors = response.data;
    }).catch(function () {
      $scope.error = "Could not load doctors. Make sure the backend is running on port 5000.";
    }).finally(function () {
      $scope.loading = false;
    });
  }]);

  // ─── DoctorController ──────────────────────────────────────────────────────
  app.controller("DoctorController", ["$scope", "$routeParams", "$location", "DoctorService", "AuthService", function ($scope, $routeParams, $location, DoctorService, AuthService) {
    $scope.doctor = null;
    $scope.form = {};
    $scope.busy = false;
    $scope.error = "";
    $scope.success = "";
    $scope.today = new Date().toISOString().slice(0, 10);
    $scope.isLoggedIn = AuthService.isLoggedIn();

    $scope.initials = function (name) {
      if (!name) return "DR";
      return name.split(" ").slice(1).map(function (x) { return x[0]; }).join("").slice(0, 2).toUpperCase();
    };

    $scope.selectSlot = function (slot) {
      $scope.form.time = slot;
    };

    DoctorService.getDoctor($routeParams.id).then(function (response) {
      $scope.doctor = response.data;
    }).catch(function () {
      $scope.error = "Doctor could not be found.";
    });

    $scope.book = function () {
      if (!AuthService.isLoggedIn()) {
        $scope.error = "Please login to book an appointment.";
        return;
      }
      if (!$scope.form.time) {
        $scope.error = "Please select a time slot.";
        return;
      }

      $scope.busy = true;
      $scope.error = "";
      $scope.success = "";

      var dateVal = $scope.form.date;
      if (dateVal instanceof Date) {
        var y = dateVal.getFullYear();
        var m = String(dateVal.getMonth() + 1).padStart(2, "0");
        var d = String(dateVal.getDate()).padStart(2, "0");
        dateVal = y + "-" + m + "-" + d;
      }

      var payload = {
        doctorId: parseInt($routeParams.id, 10),
        patientName: $scope.form.patientName,
        email: $scope.form.email,
        phone: $scope.form.phone,
        date: dateVal,
        time: $scope.form.time
      };

      DoctorService.bookAppointment(payload).then(function (response) {
        $scope.success = "Appointment booked successfully! Booking ID: " + response.data.appointment.id;
        $scope.form = {};
      }).catch(function (error) {
        $scope.error = (error.data && error.data.message) ? error.data.message : "Booking failed. Please try again.";
      }).finally(function () {
        $scope.busy = false;
      });
    };
  }]);

  // ─── AppointmentsController ────────────────────────────────────────────────
  app.controller("AppointmentsController", ["$scope", "$location", "DoctorService", "AuthService", function ($scope, $location, DoctorService, AuthService) {
    $scope.appointments = [];
    $scope.loading = true;
    $scope.error = "";

    if (!AuthService.isLoggedIn()) {
      $location.path("/auth");
      return;
    }

    $scope.formatDate = function (dateStr) {
      try {
        var d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      } catch (e) { return dateStr; }
    };

    $scope.cancel = function (id) {
      if (!confirm("Cancel this appointment?")) return;
      DoctorService.cancelAppointment(id).then(function () {
        $scope.appointments = $scope.appointments.filter(function (a) {
          return (a._id || a.id || "").toString() !== id;
        });
      }).catch(function (err) {
        $scope.error = (err.data && err.data.message) ? err.data.message : "Could not cancel appointment.";
      });
    };

    DoctorService.getAppointments().then(function (response) {
      $scope.appointments = response.data;
    }).catch(function () {
      $scope.error = "Could not load appointments. Please check your login status.";
    }).finally(function () {
      $scope.loading = false;
    });
  }]);

  // ─── AuthController ────────────────────────────────────────────────────────
  app.controller("AuthController", ["$scope", "$location", "$rootScope", "AuthService", function ($scope, $location, $rootScope, AuthService) {
    if (AuthService.isLoggedIn()) {
      $location.path("/");
      return;
    }

    $scope.isLogin = true;
    $scope.form = { name: "", email: "", password: "", confirmPassword: "" };
    $scope.loading = false;
    $scope.error = "";
    $scope.success = "";
    $scope.showPass = false;

    $scope.switchMode = function () {
      $scope.isLogin = !$scope.isLogin;
      $scope.error = "";
      $scope.success = "";
      $scope.form = { name: "", email: "", password: "", confirmPassword: "" };
    };

    $scope.submit = function () {
      $scope.error = "";
      $scope.success = "";

      if (!$scope.form.email || !$scope.form.password) {
        $scope.error = "Email and password are required.";
        return;
      }
      if ($scope.form.password.length < 6) {
        $scope.error = "Password must be at least 6 characters.";
        return;
      }
      if (!$scope.isLogin && $scope.form.confirmPassword && $scope.form.password !== $scope.form.confirmPassword) {
        $scope.error = "Passwords do not match.";
        return;
      }

      $scope.loading = true;

      var request = $scope.isLogin
        ? AuthService.login({ email: $scope.form.email, password: $scope.form.password })
        : AuthService.register({ name: $scope.form.name, email: $scope.form.email, password: $scope.form.password, confirmPassword: $scope.form.confirmPassword });

      request.then(function (response) {
        AuthService.saveAuth(response.data.token, response.data.user);
        $scope.success = response.data.message;
        $rootScope.$broadcast("userChanged");
        setTimeout(function () {
          $scope.$apply(function () {
            $location.path("/");
          });
        }, 800);
      }).catch(function (error) {
        $scope.error = (error.data && error.data.message) ? error.data.message : "Authentication failed.";
      }).finally(function () {
        $scope.loading = false;
      });
    };
  }]);

  // ─── Search Filter Directive ───────────────────────────────────────────────
  app.filter("doctorSearch", function () {
    return function (doctors, searchText) {
      if (!searchText || !searchText.trim()) return doctors;
      var q = searchText.toLowerCase().trim();
      return doctors.filter(function (d) {
        return d.name.toLowerCase().indexOf(q) !== -1 ||
          d.specialty.toLowerCase().indexOf(q) !== -1 ||
          d.location.toLowerCase().indexOf(q) !== -1;
      });
    };
  });

}());
