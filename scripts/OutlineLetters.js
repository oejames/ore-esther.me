import * as THREE from '../threejs/three.module.js';;

export default class OutlineLetters {

    constructor(font, message, size, shiftX, shiftY, shiftZ) {

        this.shiftX = shiftX;
        this.shiftY = shiftY;
        this.shiftZ = shiftZ;

        //Material
        var color = 0x000000;
        var lineMaterialBlack = new THREE.LineBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            linewidth: 1.0
        });

        //Line Text Group
        var lineText = new THREE.Object3D();

        //Array storing StartPositions of Letters
        this.startPositions = [];

        var shapes = font.generateShapes(message, size);

        //Compute Offset of all shapes combined
        this.shapesGeometry = new THREE.ShapeBufferGeometry(shapes);
        this.shapesGeometry.computeBoundingBox();

        this.xMiddle = - 0.5 * (this.shapesGeometry.boundingBox.max.x - this.shapesGeometry.boundingBox.min.x);
        this.yMiddle = - 0.5 * (this.shapesGeometry.boundingBox.max.y - this.shapesGeometry.boundingBox.min.y);

        this.xMiddle = this.xMiddle + this.shiftX;
        this.yMiddle = this.yMiddle + this.shiftY;


        //Compute hole-shapes
        var holeShapes = [];
        for (var i = 0; i < shapes.length; i++) {

            var shape = shapes[i];

            if (shape.holes && shape.holes.length > 0) {

                for (var j = 0; j < shape.holes.length; j++) {

                    var hole = shape.holes[j];
                    holeShapes.push(hole);
                }
            }
        }
        shapes.push.apply(shapes, holeShapes);


        for (var i = 0; i < shapes.length; i++) {

            var shape = shapes[i];
            var points = shape.getPoints();

            //Push First Point to Array again to close shapes 
            if (shape.getPoints().length > 0) {
                points.push(shape.getPoints()[0]);
            }

            //Create Geometry
            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            var lineMesh = new THREE.Line(geometry, lineMaterialBlack);

            // // Store original position
            let bBox = new THREE.Box3().setFromObject(lineMesh);
            let offset = new THREE.Vector3();
            bBox.getCenter(offset);

            // // Center geometry faces
            geometry.center();

            // // // Add to pivot group
            let pivot = new THREE.Object3D();
            pivot.add(lineMesh);

            // // // Offset pivot group by original position
            var pivotCenter = new THREE.Vector3();
            pivotCenter.addVectors(offset, new THREE.Vector3(this.xMiddle, this.yMiddle, 0));

            // console.log("pivot Center: ", pivotCenter);

            //Store StartPosition for animation
            this.startPositions.push(new THREE.Vector3(pivotCenter.x, pivotCenter.y, pivotCenter.z));

            pivot.position.set(pivotCenter.x, pivotCenter.y, pivotCenter.z);
            pivot.name = message + "_" + i;
            lineText.add(pivot);
        }

        this.lineText = lineText;
        this.randomPositions = [];
        this.randomRotations = [];
    }


    shiftLetters(x, y, z) {
        for (var i = 0; i < this.lineText.children.length; i++) {
            this.lineText.children[i].position.add(new THREE.Vector3(x, y, z));
            this.startPositions[i].add(new THREE.Vector3(x, y, z));
        }

        this.shiftX = x;
        this.shiftY = y;
        this.shiftZ = z;

        this.xMiddle = this.xMiddle + this.shiftX;
        this.yMiddle = this.yMiddle + this.shiftY;
    }

    calculateRandomAimingPositions(camera, wordYPos) {
        var objectChilds = this.lineText.children;
        var numberOfChildren = objectChilds.length;

        for (var i = 0; i < numberOfChildren; i++) {

            var randomZValue = 20 + Math.random() * 40;

            var zValue = randomZValue;
            var deltaZValue = camera.position.z - zValue;
            var visBox = this.visibleBox(camera, deltaZValue);
            var visBoxCornerPoints = this.cornerPoints(visBox, zValue);
            // console.log("Half z clipping plane: ", visBoxCornerPoints);

            //randomPositions.push(new THREE.Vector3(100 - Math.random()*200, 100 - Math.random()*200, 100 - Math.random()*200));
            //randomPositions.push(new THREE.Vector3(150 - Math.random() * 300, 150 - Math.random() * 300, 200 - Math.random() * 400));

            //randomPositions.push(randomAimingPoint(visBoxCornerPoints));

            // var shiftedBBmin = new THREE.Vector3(this.shapesGeometry.boundingBox.min.x + this.xMiddle, this.shapesGeometry.boundingBox.min.y + this.yMiddle, this.shapesGeometry.boundingBox.min.z);
            // var shiftedBBMax = new THREE.Vector3(this.shapesGeometry.boundingBox.max.x + this.xMiddle, this.shapesGeometry.boundingBox.max.y + this.yMiddle, this.shapesGeometry.boundingBox.max.z);

            let bBox = new THREE.Box3().setFromObject(this.lineText);

            var randomAimingPosition = this.randomAimingPointBasedOnStartPoint(visBoxCornerPoints, this.startPositions[i], bBox.min, bBox.max, wordYPos);
            randomAimingPosition.multiplyScalar(Math.random() * .5 + 1);

            this.randomPositions.push(randomAimingPosition);
            this.randomRotations.push(new THREE.Vector3(2 - Math.random() * 4, 2 - Math.random() * 4, 2 - Math.random() * 4));
        }
    }


    animateShapes(scrollPos) {
        var textChilds = this.lineText.children;

        for (var i = 0; i < this.lineText.children.length; i++) {

            // var lerpValue = scrollPos;
            var lerpValue = Math.pow(scrollPos, 0.25);
            if (scrollPos < 0) {
                lerpValue = scrollPos;
            }
            // console.log("lVal", lerpValue);

            //lerp position
            var startPosition = this.startPositions[i];
            var aimingPosition = this.randomPositions[i];
            this.lineText.children[i].position.lerpVectors(startPosition, aimingPosition, lerpValue);

            //lerp rotation
            var aimingRotation = this.randomRotations[i];
            textChilds[i].rotation.x = THREE.Math.lerp(0, aimingRotation.x * Math.PI * 2, lerpValue);
            textChilds[i].rotation.y = THREE.Math.lerp(0, aimingRotation.y * Math.PI * 2, lerpValue);
            textChilds[i].rotation.z = THREE.Math.lerp(0, aimingRotation.z * Math.PI * 2, lerpValue);
        }
    }

    ///Debug functions --> diplaying positions and directions
    debugPositionsAndDirections(scene) {
        var redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var debugMaterialLineRed = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            linewidth: 1.2
        });

        for (let point of this.randomPositions) {
            var geometry = new THREE.SphereGeometry(1, 32, 32);
            var sphere = new THREE.Mesh(geometry, redMaterial);
            sphere.position.set(point.x, point.y, point.z);
            scene.add(sphere);
            //console.log("add sphere at: ", point);
        }

        for (let point of this.startPositions) {
            var geometry = new THREE.SphereGeometry(1, 32, 32);
            var sphere = new THREE.Mesh(geometry, greenMaterial);
            sphere.position.set(point.x, point.y, point.z);
            scene.add(sphere);
            console.log("add sphere at: ", point);
        }

        for (var i = 0; i < this.randomPositions.length; i++) {
            var points = [];
            points.push(this.startPositions[i]);
            points.push(this.randomPositions[i]);
            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            var line = new THREE.Line(geometry, debugMaterialLineRed);
            scene.add(line);
        }
    }

    debugBoundingBox(scene) {
        var redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var magentaMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

        let bBox = new THREE.Box3().setFromObject(this.lineText);
        let centerPoint = new THREE.Vector3();
        bBox.getCenter(centerPoint);

        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var sphereBBMin = new THREE.Mesh(geometry, redMaterial);
        var sphereBBMax = new THREE.Mesh(geometry, redMaterial);

        var sphereMiddle = new THREE.Mesh(geometry, magentaMaterial);

        sphereBBMin.position.set(bBox.min.x, bBox.min.y, bBox.min.z);
        sphereBBMax.position.set(bBox.max.x, bBox.max.y, bBox.max.z);

        sphereMiddle.position.set(centerPoint.x, centerPoint.y, centerPoint.z);

        scene.add(sphereBBMin);
        scene.add(sphereBBMax);

        scene.add(sphereMiddle);
    }

    getBoundingBox(){
        let bBox = new THREE.Box3().setFromObject(this.lineText);
        return bBox;
    }


    ///Helper functions --> Calculation of RandomPositions (animation aimig vectors) 

    visibleBox(camera, z) {
        var t = Math.tan(THREE.Math.degToRad(camera.fov) / 2)
        var h = t * 2 * z;
        var w = h * camera.aspect;
        return new THREE.Box2(new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(w / 2, -h / 2));
    }

    cornerPoints(box2, z) {

        var indent = 0;

        var point1 = new THREE.Vector3(box2.min.x + indent, box2.min.y - indent, z);
        var point2 = new THREE.Vector3(-box2.min.x - indent, box2.min.y - indent, z);
        var point3 = new THREE.Vector3(box2.max.x - indent, box2.max.y + indent, z);
        var point4 = new THREE.Vector3(-box2.max.x + indent, box2.max.y + indent, z);

        var cornerPoints = [];
        cornerPoints.push(point1);
        cornerPoints.push(point2);
        cornerPoints.push(point3);
        cornerPoints.push(point4);

        return cornerPoints;
    }

    randomAimingPointBasedOnStartPoint(cornerPoints, startPoint, bbMin, bbMax, wordYPos) {


        var randomDirection = 0;
        var halfOfWidth = (bbMax.x - bbMin.x) / 2;
        //1. wordYPos, check where word is located (0 -> up, 1 -> middle, 2 -> down)
        //2. randomDirection of shape movement based on wordYPos and shape x-pos
        //   randomDirections: 0 -> top, 1 -> right, 2 -> down, 3 -> left
        if (wordYPos == 0) {
            //upper word -> randomDirection to top
            randomDirection = 0;
        }
        else if (wordYPos == 1) {
            //middle word -> randomDirection to left or right (based on x-Value)
            if (startPoint.x <= bbMin.x + halfOfWidth) {
                //-left
                randomDirection = 3;
            }
            else {
                //-right
                randomDirection = 1;
            }
        }
        else if (wordYPos == 2) {
            //lower word -> randomDirection to down
            randomDirection = 2;
        }

        //3. calculate random Point along given Side
        var x = 0;
        var y = 0;
        var z = cornerPoints[0].z;

        switch (randomDirection) {

            case 0:
                x = THREE.Math.lerp(cornerPoints[0].x, cornerPoints[1].x, Math.random());
                y = cornerPoints[0].y;
                break;
            case 1:
                x = cornerPoints[1].x;
                y = THREE.Math.lerp(cornerPoints[1].y, cornerPoints[2].y, Math.random());
                break;
            case 2:
                x = THREE.Math.lerp(cornerPoints[0].x, cornerPoints[1].x, Math.random());
                y = cornerPoints[2].y;
                break;
            case 3:
                x = cornerPoints[3].x;
                y = THREE.Math.lerp(cornerPoints[1].y, cornerPoints[2].y, Math.random());
                break;
            default:
                x = THREE.Math.lerp(cornerPoints[0].x, cornerPoints[1].x, Math.random());
                y = cornerPoints[0].y;

        }

        return (new THREE.Vector3(x, y, z));
    }



}