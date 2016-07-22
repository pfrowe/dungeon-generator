sandbox = (function() {
  "use strict";
  var camera = null;
  var cameraLight = null;
  var clock = new THREE.Clock();
  var controls = null;
  var dungeon = {
    dimensions : { },
    squares : []
  };
  var motion = {
    move : { x: 0, y: 0, z: 0 },
    rotate : { x : 0, y : 0, z : 0 }
  };
  var renderer = null;
  var rotationSpeed = 0.02;
  var scene = null;
  var sizeRoom = 5;
  var varsToCheck = [
    { variable : "jQuery", lib : "//code.jquery.com/jquery-3.1.0.js" },
    { variable : "THREE", lib : "//ajax.googleapis.com/ajax/libs/threejs/r76/three.min.js" },
    { variable : "THREE.FlyControls", lib : "js/FlyControls.js" }
  ];
  var vectors = {
    "97" : { fwd : -1, lat : 0, long : 0, down : false },
    "98" : { fwd : 0, lat : 0, long : 1, down : false },
    "100" : { fwd : 0, lat : -1, long : 0, down : false },
    "102" : { fwd : 0, lat : 1, long : 0, down : false },
    "103" : { fwd : 1, lat : 0, long : 0, down : false },
    "104" : { fwd : 0, lat : 0, long : -1, down : false }
  };
  var weightsDirections = [
    { checkConnection : true, dx : -1, dy : 0, dz : 0, weight: 3 },
    { checkConnection : true, dx : 1, dy : 0, dz : 0, weight: 3 },
    { checkConnection : true, dx : 0, dy : -1, dz : 0, weight: 3 },
    { checkConnection : true, dx : 0, dy : 1, dz : 0, weight: 3 },
    { checkConnection : true, dx : 0, dy : 0, dz : -1, weight: 1 },
    { checkConnection : true, dx : 0, dy : 0, dz : 1, weight: 1 }
  ];
  function CreateScene() {
    function CreateLights() {
      var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
      hemiLight.color.setHSL(0, 0, 1);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      hemiLight.position.set(0, 0, 100);
      scene.add(hemiLight);
      cameraLight = new THREE.PointLight(0xffffff, 5, 100, 2.0);
      cameraLight.castShadow = true;
      scene.add(cameraLight);
    }
    function CreateGround() {
      var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
      var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
      groundMat.color.setHSL( 0.333, 1, 0.75 );
      var ground = new THREE.Mesh( groundGeo, groundMat );
      ground.position.z = -3;
      scene.add( ground );
      ground.receiveShadow = true;
    }
    function InitControls() {
      controls = new THREE.FlyControls(camera);
      controls.movementSpeed = 50;
      controls.rollSpeed = Math.PI / 24;
      controls.autoForward = false;
      controls.dragToLook = false;
    }
    function InitRenderer() {
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(750, 750);
      renderer.physicallyCorrectLights = true;
      renderer.gammaInput = true;
      renderer.gammaOutput = true;
      renderer.shadowMap.enabled = true;
      renderer.toneMapping = THREE.ReinhardToneMapping;
    }
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x040404, 10, 300);
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    InitRenderer();
    CreateLights();
    CreateGround();
    InitControls();
    $("#content").append(renderer.domElement);
    controls.domElement = renderer.domElement;
  }
  function GenerateMaze() {
    function ConnectSquares(coordsCurrent, coordsNext) {
      dungeon.squares[coordsCurrent.z][coordsCurrent.y][coordsCurrent.x].doors.push(coordsNext);
      dungeon.squares[coordsNext.z][coordsNext.y][coordsNext.x].doors.push(coordsCurrent);
      var dx = coordsNext.x - coordsCurrent.x;
      var dy = coordsNext.y - coordsCurrent.y;
      var dz = coordsNext.z - coordsCurrent.z;
      var createCorridor = (Math.abs(dx) <= 1) && (Math.abs(dy) <= 1) && (Math.abs(dz) <= 1);
      if (createCorridor) {
        var lenCorridor = Math.sqrt(dx * dx + dy * dy + dz * dz) * sizeRoom;
        var geometry = new THREE.BoxBufferGeometry(lenCorridor, sizeRoom * 0.5, sizeRoom * 0.5);
        var corridor = new THREE.Mesh(geometry, material);
        corridor.position.x = (coordsCurrent.x + coordsNext.x - dungeon.dimensions.x) * sizeRoom / 2;
        corridor.position.y = (coordsCurrent.y + coordsNext.y - dungeon.dimensions.y) * sizeRoom / 2;
        corridor.position.z = (coordsCurrent.z + coordsNext.z + 1) * sizeRoom / 2;
        corridor.rotation.y = Math.atan2(dz, dx);
        corridor.rotation.z = Math.atan2(dy, dx);
        scene.add(corridor);
      }
    }
    function DoConnectionsRemain(coordsCurrent) {
      var canConnect = false;
      weightsDirections.forEach(function checkDirection(dirTest) {
        if (dirTest.checkConnection) {
          var coordsTest = {
            x : coordsCurrent.x + dirTest.dx,
            y : coordsCurrent.y + dirTest.dy,
            z : coordsCurrent.z + dirTest.dz
          };
          canConnect = canConnect || (IsInBounds(coordsTest) && !IsConnected(coordsTest));
        }
      });
      return canConnect;
    }
    function GenerateWeightedDirections() {
      weightsDirections.forEach(function addWeightedDirection(weightDir) {
        dirsWeighted = dirsWeighted.concat(new Array(weightDir.weight).fill(weightDir));
      });
    }
    function GetRandomDirection() {
      return dirsWeighted[Math.floor(Math.random() * dirsWeighted.length)];
    }
    function IsConnected(x, y, z) {
      if (typeof x == "object") {
        z = x.z;
        y = x.y;
        x = x.x;
      }
      return dungeon.squares[z][y][x].doors.length > 0;
    }
    function IsInBounds(x, y, z) {
      if (typeof x == "object") {
        z = x.z;
        y = x.y;
        x = x.x;
      }
      var isInBounds = (z >= 0) && (z < dungeon.squares.length);
      isInBounds = isInBounds && ((y >= 0) && (y < dungeon.squares[z].length));
      isInBounds = isInBounds && ((x >= 0) && (x < dungeon.squares[z][y].length));
      return isInBounds;
    }
    var dirsWeighted = [];
    var coordsQueue = [];
    var coordsCurrent = { x : 0, y : 0, z : Math.floor(Math.random() * dungeon.squares.length) };
    var material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    GenerateWeightedDirections();
    coordsCurrent.y = Math.floor(Math.random() * dungeon.squares[coordsCurrent.z].length);
    coordsCurrent.x = Math.floor(Math.random() * dungeon.squares[coordsCurrent.z][coordsCurrent.y].length);
    coordsQueue.push(coordsCurrent);
    while (coordsQueue.length > 0) {
      coordsCurrent = coordsQueue[0];
      var directionNext = GetRandomDirection();
      var coordsNext = {
        x : coordsCurrent.x + directionNext.dx,
        y : coordsCurrent.y + directionNext.dy,
        z : coordsCurrent.z + directionNext.dz
      };
      if (IsInBounds(coordsNext) && !IsConnected(coordsNext)) {
        ConnectSquares(coordsCurrent, coordsNext);
        coordsQueue.push(coordsNext);
      }
      if (DoConnectionsRemain(coordsCurrent)) {
        coordsQueue.push(coordsCurrent);
      }
      coordsQueue.splice(0, 1);
    }
  }
  function InitializeSquares() {
    var countX = dungeon.dimensions.x = $("#countX").val();
    var countY = dungeon.dimensions.y = $("#countY").val();
    var countZ = dungeon.dimensions.z = $("#countZ").val();
    camera.position.z = Math.max(countX, countY, countZ) * sizeRoom / 2;
    var geometry = new THREE.BoxBufferGeometry(sizeRoom * 0.6, sizeRoom * 0.6, sizeRoom * 0.6);
    var material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    for (var iz = 0; iz < countZ; ++iz) {
      dungeon.squares[iz] = [];
      var positionZ = (iz * sizeRoom) + (sizeRoom / 2);
      for (var iy = 0; iy < countY; ++iy) {
        dungeon.squares[iz][iy] = [];
        var positionY = (iy - (countY / 2)) * sizeRoom;
        for (var ix = 0; ix < countX; ++ix) {
          dungeon.squares[iz][iy][ix] = { doors : [] };
          var positionX = (ix - (countX / 2)) * sizeRoom;
          var color = new THREE.Color(ix / countX, iy / countY, iz / countZ);
          var material = new THREE.MeshLambertMaterial({ color : color });
          var cube = new THREE.Mesh(geometry, material);
          cube.position.x = positionX;
          cube.position.y = positionY;
          cube.position.z = positionZ;
          cube.castShadow = true;
          cube.receiveShadow = true;
          scene.add(cube);
        }
      }
    }
  }
  function Render() {
    requestAnimationFrame(Render);
    var delta = clock.getDelta();
    controls.update(delta);
    cameraLight.position.set(camera.position);
    renderer.render(scene, camera);
  }
  function onLoad(event) {
    function CreateScriptElement(pathScript) {
      var $scriptNew = $(document.createElement("script"));
      $scriptNew.attr("src", pathScript).attr("type", "text/javascript");
      $scriptNew.appendTo(document.body);
    }
    var dtNow = new Date();
    var isReady = true;
    varsToCheck.forEach(function(el, i) {
      if (typeof el.isReady == "undefined") {
        el.isReady = false;
      }
      if (!el.isReady) {
        try { eval(el.variable); el.isReady = true; } catch (err) { el.isReady = false; }
      }
      if (typeof el.isLoaded == "undefined") {
        el.isLoaded = el.isReady;
      }
      isReady = isReady && el.isReady;
      if (!el.isLoaded && ((dtNow - dtInit) * 24 * 60 * 60 > 1)) {
        if (typeof el.lib == "string") {
          CreateScriptElement(el.lib);
          el.isLoaded = true;
        } else if (typeof el.exec == "function") {
          el.isLoaded = el.exec();
        }
      }
    });
    if (!isReady) {
      setTimeout(onLoad, 100);
    } else {
      $(document).ready(onReady);
    }
    return this;
  }
  function onReady(event) {
    CreateScene();
    InitializeSquares();
    setTimeout(GenerateMaze, 100);
    Render();
    return this;
  }
  onLoad();
  return {};
})();