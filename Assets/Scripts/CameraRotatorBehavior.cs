using UnityEngine;

public class CameraRotatorBehavior : MonoBehaviour
{
    [SerializeField] Transform brainCameraRotator;
    [SerializeField] Camera brainCamera;


    private Vector3 initialCameraRotatorPosition;
    private Vector3 cameraPositionOffset;

    public float totalPitch = 45f;
    public float totalYaw = -22.5f;
    public float totalSpin = 0f;



    public static float doubleClickTime = 0.2f;
    public float minFoV = 15.0f;
    public float maxFoV = 90.0f;
    public float fovDelta = 15.0f;
    public float orthoDelta = 5.0f;
    public float moveSpeed = 10.0f;
    public float rotSpeed = 200.0f;
    [SerializeField] private float shiftMult = 2f;
    [SerializeField] private float ctrlMult = 0.5f;
    public float minXRotation = -90;
    public float maxXRotation = 90;
    public float minZRotation = -90;
    public float maxZRotation = 90;

    private bool mouseDownOverBrain;
    private int mouseButtonDown;
    private bool brainTransformChanged;
    private float lastLeftClick;
    private float lastRightClick;

    private Vector3 cameraTarget;

    private bool blockBrainControl;

    // auto-rotation
    private bool autoRotate;
    private float autoRotateSpeed = 10.0f;
    private float noInteractionDelay = 10.0f;
    private float lastInteractionTime;

    private void Awake()
    {
        // Artifically limit the framerate
#if !UNITY_WEBGL
        Application.targetFrameRate = 144;
#endif
        cameraTarget = Vector3.zero;
        initialCameraRotatorPosition = brainCameraRotator.transform.position;
        cameraPositionOffset = Vector3.zero;
        autoRotate = true;
    }

    void Update()
    {
        // Check the scroll wheel and deal with the field of view
        float fov = brainCamera.orthographic ? brainCamera.orthographicSize : brainCamera.fieldOfView;

        float scroll = -Input.GetAxis("Mouse ScrollWheel");
        fov += (brainCamera.orthographic ? orthoDelta : fovDelta) * scroll * SpeedMultiplier();
        fov = Mathf.Clamp(fov, minFoV, maxFoV);

        if (brainCamera.orthographic)
            brainCamera.orthographicSize = fov;
        else
            brainCamera.fieldOfView = fov;

        // Now check if the mouse wheel is being held down
        //if (Input.GetMouseButton(1) && !blockBrainControl)
        //{
        //    mouseDownOverBrain = true;
        //    mouseButtonDown = 1;
        //    autoRotate = false;
        //}

        // Now deal with dragging
        if (Input.GetMouseButtonDown(0) && !blockBrainControl)
        {
            //BrainCameraDetectTargets();
            mouseDownOverBrain = true;
            mouseButtonDown = 0;
            autoRotate = false;
        }

        if (autoRotate)
        {
            totalSpin += autoRotateSpeed * Time.deltaTime;
            ApplyBrainCameraPositionAndRotation();
        }
        else
            BrainCameraControl_noTarget();

        if (!mouseDownOverBrain && (Time.realtimeSinceStartup - lastInteractionTime) > noInteractionDelay)
            autoRotate = true;

        blockBrainControl = false;
    }

    private float SpeedMultiplier()
    {
        if (Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift))
            return shiftMult;
        else if (Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.RightControl))
            return ctrlMult;
        else
            return 1f;
    }
    void BrainCameraControl_noTarget()
    {
        if (Input.GetMouseButtonUp(0))
        {
            SetControlBlock(false);
            lastInteractionTime = Time.realtimeSinceStartup;
        }

        if (mouseDownOverBrain && !Input.GetMouseButtonDown(0))
        {
            // Deal with releasing the mouse (anywhere)
            if (mouseButtonDown == 0 && Input.GetMouseButtonUp(0))
            {
                lastLeftClick = Time.realtimeSinceStartup;
                ClearMouseDown();
                return;
            }
            //if (mouseButtonDown == 1 && Input.GetMouseButtonUp(1))
            //{
            //    if (!brainTransformChanged)
            //    {
            //        // Check for double click
            //        if ((Time.realtimeSinceStartup - lastRightClick) < doubleClickTime)
            //        {
            //            // Reset the brainCamera transform position
            //            brainCamera.transform.localPosition = Vector3.zero;
            //        }
            //    }

            //    lastRightClick = Time.realtimeSinceStartup;
            //    ClearMouseDown(); return;
            //}

            //if (mouseButtonDown == 1)
            //{
            //    // While right-click is held down 
            //    float xMove = Input.GetAxis("Mouse X") * moveSpeed * SpeedMultiplier() * Time.deltaTime;
            //    float yMove = Input.GetAxis("Mouse Y") * moveSpeed * SpeedMultiplier() * Time.deltaTime;

            //    if (xMove != 0 || yMove != 0)
            //    {
            //        brainTransformChanged = true;
            //        brainCamera.transform.Translate(xMove, yMove, 0, Space.Self);
            //    }
            //}

            // If the mouse is down, even if we are far way now we should drag the brain
            if (mouseButtonDown == 0)
            {
                float xRot = Input.GetAxis("Mouse X") * rotSpeed * SpeedMultiplier() * Time.deltaTime;
                float yRot = Input.GetAxis("Mouse Y") * rotSpeed * SpeedMultiplier() * Time.deltaTime;

                if (xRot != 0 || yRot != 0)
                {
                    brainTransformChanged = true;

                    // Pitch Locally, Yaw Globally. See: https://gamedev.stackexchange.com/questions/136174/im-rotating-an-object-on-two-axes-so-why-does-it-keep-twisting-around-the-thir

                    // if space is down, we can apply spin instead of yaw
                    if (Input.GetKey(KeyCode.Space))
                    {
                        totalYaw = Mathf.Clamp(totalYaw + xRot, minXRotation, maxXRotation);
                    }
                    else
                    {
                        // [TODO] Pitch and Yaw are flipped?
                        totalSpin += xRot;
                        totalPitch = Mathf.Clamp(totalPitch - yRot, minZRotation, maxZRotation);
                    }

                    ApplyBrainCameraPositionAndRotation();
                }
            }
        }
    }

    void ApplyBrainCameraPositionAndRotation()
    {
     
        Quaternion curRotation = Quaternion.Euler(totalPitch, totalSpin, totalYaw);
        brainCameraRotator.rotation = curRotation;
        // Move the camera back to zero, perform rotation, then offset back
        //brainCameraRotator.transform.position = initialCameraRotatorPosition + cameraPositionOffset;
        //brainCameraRotator.transform.LookAt(cameraTarget, Vector3.back);
        //brainCameraRotator.transform.position = curRotation * (brainCameraRotator.transform.position - cameraTarget) + cameraTarget;
        //brainCameraRotator.transform.rotation = curRotation * brainCameraRotator.transform.rotation;
    }

    void ClearMouseDown()
    {
        mouseDownOverBrain = false;
        //brainCameraClickthroughTarget = null;
        brainTransformChanged = false;
    }

    public void SetControlBlock(bool state)
    {
        blockBrainControl = state;
    }
}
